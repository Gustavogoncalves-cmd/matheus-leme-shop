#!/usr/bin/env node

/**
 * Generate secure secrets for production deployment
 * Usage: node scripts/generate-secrets.js
 */

const crypto = require('crypto');

console.log('\n' + '='.repeat(60));
console.log('🔐 Production Secrets Generator');
console.log('='.repeat(60) + '\n');

// Generate JWT Secret (32 bytes = 256 bits)
const jwtSecret = crypto.randomBytes(32).toString('hex');
console.log('JWT_SECRET:');
console.log(`${jwtSecret}\n`);

// Generate MercadoPago Webhook Secret (alternative key)
const mpWebhookSecret = crypto.randomBytes(32).toString('hex');
console.log('MERCADOPAGO_WEBHOOK_SECRET (if custom):');
console.log(`${mpWebhookSecret}\n`);

// Generate Database Password
const dbPassword = crypto.randomBytes(16).toString('hex');
console.log('DATABASE_PASSWORD (if using default):');
console.log(`${dbPassword}\n`);

// Generate API Key (alternative format)
const apiKey = crypto.randomBytes(32).toString('base64');
console.log('API_KEY (alternative format):');
console.log(`${apiKey}\n`);

console.log('='.repeat(60));
console.log('📋 Copy the values above to your production .env file');
console.log('='.repeat(60));
console.log('\n⚠️  IMPORTANT:');
console.log('  1. Keep these secrets private - NEVER commit to git');
console.log('  2. Store in your deployment platform (Railway, Render, etc.)');
console.log('  3. Use different secrets for each environment');
console.log('  4. Rotate secrets periodically (every 90 days)');
console.log('  5. If leaked, regenerate immediately and redeploy\n');

console.log('🔗 Where to store:');
console.log('  - Railway: Settings > Environment Variables');
console.log('  - Render: Settings > Environment > Environment Variables');
console.log('  - Vercel: Settings > Environment Variables');
console.log('  - Netlify: Settings > Build & Deploy > Environment\n');
