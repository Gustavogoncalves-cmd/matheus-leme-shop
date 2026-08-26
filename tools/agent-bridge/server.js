#!/usr/bin/env node
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const HOST = process.env.BRIDGE_HOST || '127.0.0.1';
const PORT = Number(process.env.BRIDGE_PORT || 8787);
const TOKEN = process.env.BRIDGE_TOKEN;
const DATA_DIR = process.env.BRIDGE_DATA_DIR || path.join(__dirname, 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'messages.jsonl');
const MAX_BODY = 64 * 1024;
const clients = new Set();

if (!TOKEN || TOKEN.length < 24) {
  console.error('Defina BRIDGE_TOKEN com pelo menos 24 caracteres antes de iniciar.');
  process.exit(1);
}
fs.mkdirSync(DATA_DIR, { recursive: true });

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
    'Cache-Control': 'no-store',
  });
  res.end(payload);
}

function authorized(req) {
  const header = req.headers.authorization || '';
  const supplied = header.startsWith('Bearer ') ? header.slice(7) : '';
  return supplied.length === TOKEN.length && crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(TOKEN));
}

function parseLimit(url) {
  const value = Number(url.searchParams.get('limit') || 50);
  return Number.isInteger(value) ? Math.min(Math.max(value, 1), 200) : 50;
}

function readMessages(limit) {
  if (!fs.existsSync(HISTORY_FILE)) return [];
  return fs.readFileSync(HISTORY_FILE, 'utf8').trim().split('\n').filter(Boolean).slice(-limit).map((line) => JSON.parse(line));
}

function broadcast(message) {
  const payload = `data: ${JSON.stringify(message)}\n\n`;
  for (const res of clients) res.write(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (Buffer.byteLength(data) > MAX_BODY) {
        reject(new Error('payload_too_large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try { resolve(JSON.parse(data || '{}')); } catch { reject(new Error('invalid_json')); }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (req.method === 'GET' && url.pathname === '/health') return json(res, 200, { ok: true, service: 'agent-bridge' });
  if (!authorized(req)) return json(res, 401, { error: 'unauthorized' });

  if (req.method === 'GET' && url.pathname === '/messages') {
    return json(res, 200, { messages: readMessages(parseLimit(url)) });
  }

  if (req.method === 'GET' && url.pathname === '/events') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    res.write(': connected\n\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  if (req.method === 'POST' && url.pathname === '/messages') {
    try {
      const body = await readBody(req);
      if (!['claude-code', 'manus', 'user'].includes(body.sender)) return json(res, 400, { error: 'invalid_sender' });
      if (typeof body.text !== 'string' || !body.text.trim() || body.text.length > 16000) return json(res, 400, { error: 'invalid_text' });
      const message = { id: crypto.randomUUID(), sender: body.sender, text: body.text.trim(), createdAt: new Date().toISOString() };
      fs.appendFileSync(HISTORY_FILE, `${JSON.stringify(message)}\n`, { mode: 0o600 });
      broadcast(message);
      return json(res, 201, message);
    } catch (error) {
      return json(res, error.message === 'payload_too_large' ? 413 : 400, { error: error.message });
    }
  }

  return json(res, 404, { error: 'not_found' });
});

server.listen(PORT, HOST, () => console.log(`Agent bridge ativo em http://${HOST}:${PORT}`));
