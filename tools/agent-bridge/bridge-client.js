#!/usr/bin/env node
'use strict';

const http = require('http');
const base = process.env.BRIDGE_URL || 'http://127.0.0.1:8787';
const token = process.env.BRIDGE_TOKEN;
const command = process.argv[2];
const value = process.argv.slice(3).join(' ').trim();

if (!token) { console.error('Defina BRIDGE_TOKEN.'); process.exit(1); }
if (!['send', 'read', 'watch'].includes(command)) { console.error('Uso: bridge-client.js send|read|watch [mensagem]'); process.exit(1); }

function request(method, pathname, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(pathname, base);
    const req = http.request(url, { method, headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) } }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => res.statusCode >= 200 && res.statusCode < 300 ? resolve(data) : reject(new Error(`${res.statusCode}: ${data}`)));
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

(async () => {
  if (command === 'send') {
    if (!value) throw new Error('Informe a mensagem.');
    console.log(await request('POST', '/messages', { sender: 'claude-code', text: value }));
  } else if (command === 'read') {
    console.log(await request('GET', '/messages?limit=50'));
  } else {
    const url = new URL('/events', base);
    const req = http.request(url, { headers: { Authorization: `Bearer ${token}` } }, (res) => {
      res.setEncoding('utf8');
      let buffer = '';
      res.on('data', (chunk) => {
        buffer += chunk;
        const parts = buffer.split('\n\n');
        buffer = parts.pop();
        for (const part of parts) {
          const line = part.split('\n').find((item) => item.startsWith('data: '));
          if (line) console.log(JSON.parse(line.slice(6)));
        }
      });
    });
    req.on('error', (error) => { console.error(error.message); process.exit(1); });
    req.end();
  }
})().catch((error) => { console.error(error.message); process.exit(1); });
