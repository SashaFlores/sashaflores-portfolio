#!/usr/bin/env node

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const payloadPath = path.resolve(__dirname, '..', 'data', 'latest-post.json');

if (!fs.existsSync(payloadPath)) {
  console.error(`Missing payload file: ${payloadPath}`);
  process.exit(1);
}

const raw = fs.readFileSync(payloadPath, 'utf8');
let payload;
try {
  payload = JSON.parse(raw);
} catch (error) {
  console.error('Invalid JSON in data/latest-post.json');
  console.error(error);
  process.exit(1);
}

const emailOverrideArgs = process.argv.filter((arg) => arg.startsWith('--email=') || arg.startsWith('--emails='));
let overrideEmails = [];
if (emailOverrideArgs.length) {
  emailOverrideArgs.forEach((arg) => {
    const value = arg.split('=')[1] || '';
    overrideEmails.push(...value.split(','));
  });
} else if (process.env.NOTIFY_OVERRIDE_EMAILS) {
  overrideEmails = process.env.NOTIFY_OVERRIDE_EMAILS.split(',');
}

overrideEmails = overrideEmails
  .map((email) => (email ? String(email).trim() : ''))
  .filter(Boolean);

const required = ['title', 'url'];
for (const field of required) {
  if (!payload[field] || String(payload[field]).trim() === '') {
    console.error(`Missing required field "${field}" in data/latest-post.json`);
    process.exit(1);
  }
}

let base = process.env.NOTIFY_BASE_URL || process.env.NETLIFY_SITE_DOMAIN || process.env.DEPLOY_URL;
if (!base || base.trim() === '') {
  base = 'http://localhost:8888';
}

if (!/^https?:\/\//.test(base)) {
  const protocol = base.includes('localhost') ? 'http' : 'https';
  base = `${protocol}://${base}`;
}

const functionUrl = new URL('/.netlify/functions/notify-subscribers', base).toString();

console.log(`Sending notification via ${functionUrl}`);

try {
  const body = { ...payload };
  if (overrideEmails.length) {
    console.log(`Overriding recipients: ${overrideEmails.join(', ')}`);
    body.recipients = overrideEmails;
  }

  const response = await fetch(functionUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const text = await response.text();
  if (!response.ok) {
    console.error(`Request failed with status ${response.status}`);
    console.error(text);
    process.exit(1);
  }

  console.log(text);
} catch (error) {
  console.error('Failed to call notify-subscribers function');
  console.error(error);
  process.exit(1);
}
