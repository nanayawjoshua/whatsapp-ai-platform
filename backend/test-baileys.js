#!/usr/bin/env node
/**
 * Minimal Baileys test - just to see if we can get a QR code
 */

import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import pino from 'pino';

async function test() {
  console.log('Testing Baileys connection...\n');

  const { state, saveCreds } = await useMultiFileAuthState('./test-session');

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'debug' }) // Enable debug logging
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    console.log('Connection update:', JSON.stringify(update, null, 2));

    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\n✅ QR CODE RECEIVED!');
      console.log('QR Data:', qr);
    }

    if (connection === 'close') {
      console.log('\nConnection closed.');
      console.log('Status code:', lastDisconnect?.error?.output?.statusCode);
      console.log('Error:', lastDisconnect?.error);
    }

    if (connection === 'open') {
      console.log('\n✅ CONNECTED!');
      process.exit(0);
    }
  });
}

test().catch(console.error);
