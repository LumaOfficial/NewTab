/**
 * Password hashing, tokens, and encryption of stored integration tokens.
 *
 * Passwords are never stored: only a scrypt hash with a per-user salt. Tokens
 * handed to the browser are random opaque values kept server-side.
 */
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  scrypt,
  timingSafeEqual,
} from 'node:crypto';
import { promisify } from 'node:util';
import { config } from './config.js';

const scryptAsync = promisify(scrypt);

export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derived = await scryptAsync(password, salt, 64);
  return `scrypt$${salt}$${derived.toString('hex')}`;
}

export async function verifyPassword(password, stored) {
  if (typeof password !== 'string' || typeof stored !== 'string') return false;
  const [scheme, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;

  const derived = await scryptAsync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString('base64url');
}

/** Six digits, shown to the user when email delivery is not connected. */
export function randomCode() {
  return String(randomBytes(4).readUInt32BE(0) % 1000000).padStart(6, '0');
}

export function hashShortCode(code) {
  return createHash('sha256').update(`luma:${code}`).digest('hex');
}

function encryptionKey() {
  if (!config.tokenKey) return null;
  return createHash('sha256').update(config.tokenKey).digest();
}

/** Encrypts a token for storage. Returns null when no key is configured. */
export function encryptSecret(value) {
  const key = encryptionKey();
  if (!key || typeof value !== 'string') return null;

  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return {
    iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'),
    value: encrypted.toString('base64'),
  };
}

export function decryptSecret(payload) {
  const key = encryptionKey();
  if (!key || !payload) return null;

  try {
    const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(payload.iv, 'base64'));
    decipher.setAuthTag(Buffer.from(payload.tag, 'base64'));
    return Buffer.concat([
      decipher.update(Buffer.from(payload.value, 'base64')),
      decipher.final(),
    ]).toString('utf8');
  } catch {
    return null;
  }
}

export function normalizeEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}
