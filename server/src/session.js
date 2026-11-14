/**
 * Session handling: opaque tokens in an HttpOnly cookie, one row per device.
 * Sessions live server-side, so "sign out everywhere" is a real revocation.
 */
import { config } from './config.js';
import { db } from './store.js';
import { randomToken } from './security.js';

const COOKIE = 'luma_session';

export function parseCookies(header) {
  const result = {};
  if (typeof header !== 'string') return result;

  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index === -1) continue;
    const name = part.slice(0, index).trim();
    if (!name) continue;
    result[name] = decodeURIComponent(part.slice(index + 1).trim());
  }
  return result;
}

function isSecure(req) {
  return req.secure || req.get('x-forwarded-proto') === 'https';
}

export function deviceLabel(req) {
  const explicit = req.get('x-luma-device-label');
  if (explicit) return explicit.slice(0, 60);

  const ua = req.get('user-agent') ?? '';
  const browser = /Edg\//.test(ua)
    ? 'Edge'
    : /OPR\//.test(ua)
      ? 'Opera'
      : /Chrome\//.test(ua)
        ? 'Chrome'
        : /Firefox\//.test(ua)
          ? 'Firefox'
          : /Safari\//.test(ua)
            ? 'Safari'
            : 'Browser';
  const platform = /Windows/.test(ua)
    ? 'Windows'
    : /Mac OS X/.test(ua)
      ? 'macOS'
      : /Android/.test(ua)
        ? 'Android'
        : /iPhone|iPad/.test(ua)
          ? 'iOS'
          : /Linux/.test(ua)
            ? 'Linux'
            : 'this device';

  return `${browser} on ${platform}`;
}

export function createSession(userId, req) {
  const now = Date.now();
  const session = {
    id: `ses_${randomToken(6)}`,
    token: randomToken(32),
    userId,
    deviceId: (req.get('x-luma-device-id') ?? '').slice(0, 80) || 'unknown',
    deviceLabel: deviceLabel(req),
    createdAt: now,
    lastSeenAt: now,
    expiresAt: now + config.sessionDays * 24 * 60 * 60 * 1000,
  };

  db().sessions.push(session);
  return session;
}

export function sessionFromRequest(req) {
  const token = parseCookies(req.headers.cookie)[COOKIE];
  if (!token) return null;

  const session = db().sessions.find((entry) => entry.token === token);
  if (!session) return null;

  if (session.expiresAt <= Date.now()) {
    db().sessions = db().sessions.filter((entry) => entry.id !== session.id);
    return null;
  }

  // Keep "last seen" roughly fresh without writing on every request.
  if (Date.now() - session.lastSeenAt > 60_000) {
    session.lastSeenAt = Date.now();
  }
  return session;
}

export function attachUser(req, _res, next) {
  const session = sessionFromRequest(req);
  if (session) {
    req.session = session;
    req.user = db().users.find((entry) => entry.id === session.userId) ?? null;
  }
  next();
}

export function requireUser(req, res, next) {
  if (!req.user) {
    res.status(401).json({ error: { code: 'unauthorized', message: 'Sign in to continue.' } });
    return;
  }
  next();
}

export function setSessionCookie(res, token, req) {
  const maxAge = config.sessionDays * 24 * 60 * 60;
  const secure = isSecure(req) ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`,
  );
}

export function clearSessionCookie(res, req) {
  const secure = isSecure(req) ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`);
}

export function revokeSession(sessionId) {
  db().sessions = db().sessions.filter((entry) => entry.id !== sessionId);
}

export function revokeAllSessions(userId) {
  db().sessions = db().sessions.filter((entry) => entry.userId !== userId);
}

export function publicDevice(session, currentSessionId) {
  return {
    id: session.id,
    label: session.deviceLabel,
    createdAt: session.createdAt,
    lastSeenAt: session.lastSeenAt,
    current: session.id === currentSessionId,
  };
}

/** Drop expired sessions; cheap enough to run on startup and per auth request. */
export function pruneSessions() {
  const now = Date.now();
  const before = db().sessions.length;
  db().sessions = db().sessions.filter((entry) => entry.expiresAt > now);
  return before - db().sessions.length;
}
