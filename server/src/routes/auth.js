import { Router } from 'express';
import { config } from '../config.js';
import { db, save } from '../store.js';
import {
  hashPassword,
  hashShortCode,
  isEmail,
  normalizeEmail,
  randomCode,
  verifyPassword,
} from '../security.js';
import {
  clearSessionCookie,
  createSession,
  publicDevice,
  pruneSessions,
  requireUser,
  revokeAllSessions,
  revokeSession,
  setSessionCookie,
} from '../session.js';
import { credentialsFor, SOCIAL_PROVIDERS } from '../catalog.js';
import { defaultSyncRecord } from '../syncState.js';

export const authRouter = Router();

export function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    emailVerified: Boolean(user.emailVerified),
    createdAt: user.createdAt,
    hasPassword: Boolean(user.passwordHash),
  };
}

function fail(res, status, code, message, extra = {}) {
  res.status(status).json({ error: { code, message, ...extra } });
}

function passwordProblem(password) {
  if (typeof password !== 'string' || password.length < 8) {
    return 'Use at least 8 characters for your password.';
  }
  if (password.length > 200) {
    return 'That password is too long.';
  }
  return null;
}

function verificationPayload(userId) {
  const record = db().verification[userId];
  if (!record) return { required: false };

  return {
    required: true,
    devCode: config.exposeDevCodes ? record.code : undefined,
    devNotice: config.exposeDevCodes
      ? 'Email delivery is not connected in this preview, so the code is shown here instead of being emailed.'
      : undefined,
  };
}

function startEmailVerification(userId) {
  const code = randomCode();
  db().verification[userId] = {
    code,
    hash: hashShortCode(code),
    expiresAt: Date.now() + config.verificationMinutes * 60 * 1000,
    attempts: 0,
  };
  return code;
}

authRouter.get('/providers', (_req, res) => {
  res.json({
    providers: SOCIAL_PROVIDERS.map((provider) => {
      const credentials = credentialsFor(provider.id);
      return {
        id: provider.id,
        label: provider.label,
        configured: credentials.configured,
        note: provider.note,
        env: credentials.env,
      };
    }),
  });
});

authRouter.post('/signup', async (req, res) => {
  pruneSessions();

  const email = normalizeEmail(req.body?.email);
  const password = req.body?.password;
  const name = typeof req.body?.name === 'string' ? req.body.name.trim().slice(0, 60) : '';

  if (!isEmail(email)) return fail(res, 400, 'invalid_email', 'Enter a valid email address.');

  const problem = passwordProblem(password);
  if (problem) return fail(res, 400, 'weak_password', problem);

  const state = db();
  if (state.users.some((user) => user.email === email)) {
    return fail(
      res,
      409,
      'email_taken',
      'An account with that email already exists. Try signing in instead.',
    );
  }

  const user = {
    id: `usr_${Math.random().toString(36).slice(2, 10)}`,
    email,
    name,
    passwordHash: await hashPassword(password),
    emailVerified: false,
    createdAt: Date.now(),
  };

  state.users.push(user);
  state.sync[user.id] = defaultSyncRecord();
  startEmailVerification(user.id);

  const session = createSession(user.id, req);
  setSessionCookie(res, session.token, req);
  await save();

  res.status(201).json({
    user: publicUser(user),
    verification: verificationPayload(user.id),
  });
});

authRouter.post('/login', async (req, res) => {
  pruneSessions();

  const email = normalizeEmail(req.body?.email);
  const password = req.body?.password;
  const user = db().users.find((entry) => entry.email === email);

  if (!user || !user.passwordHash) {
    // Social-only accounts get the same generic answer, without leaking which.
    return fail(res, 401, 'invalid_credentials', 'Email or password is incorrect.');
  }

  if (!(await verifyPassword(password, user.passwordHash))) {
    return fail(res, 401, 'invalid_credentials', 'Email or password is incorrect.');
  }

  const session = createSession(user.id, req);
  setSessionCookie(res, session.token, req);
  await save();

  res.json({ user: publicUser(user), verification: verificationPayload(user.id) });
});

authRouter.post('/logout', async (req, res) => {
  if (req.session) revokeSession(req.session.id);
  clearSessionCookie(res, req);
  await save();
  res.json({ ok: true });
});

authRouter.post('/logout-all', requireUser, async (req, res) => {
  revokeAllSessions(req.user.id);
  clearSessionCookie(res, req);
  await save();
  res.json({ ok: true });
});

authRouter.get('/session', (req, res) => {
  if (!req.user) return fail(res, 401, 'unauthorized', 'Sign in to continue.');

  res.json({
    user: publicUser(req.user),
    verification: verificationPayload(req.user.id),
    device: publicDevice(req.session, req.session.id),
  });
});

authRouter.post('/verify-email', requireUser, async (req, res) => {
  const record = db().verification[req.user.id];
  if (!record) return res.json({ ok: true, emailVerified: true });

  if (record.expiresAt <= Date.now()) {
    return fail(res, 410, 'code_expired', 'That code has expired. Request a new one.');
  }
  if (record.attempts >= 5) {
    return fail(res, 429, 'too_many_attempts', 'Too many tries. Request a new code.');
  }

  record.attempts += 1;
  const submitted = String(req.body?.code ?? '').trim();

  if (hashShortCode(submitted) !== record.hash) {
    await save();
    return fail(res, 400, 'invalid_code', 'That code doesn’t match. Check the six digits and try again.');
  }

  req.user.emailVerified = true;
  delete db().verification[req.user.id];
  await save();

  res.json({ ok: true, emailVerified: true });
});

authRouter.post('/verify-email/resend', requireUser, async (req, res) => {
  if (req.user.emailVerified) return res.json({ ok: true, emailVerified: true });

  startEmailVerification(req.user.id);
  await save();
  res.json({ ok: true, verification: verificationPayload(req.user.id) });
});

authRouter.post('/password/forgot', async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const user = db().users.find((entry) => entry.email === email);

  let dev = {};
  if (user) {
    const code = randomCode();
    db().resets[user.id] = {
      code,
      hash: hashShortCode(code),
      expiresAt: Date.now() + config.resetMinutes * 60 * 1000,
      attempts: 0,
    };
    if (config.exposeDevCodes) {
      dev = {
        devCode: code,
        devNotice:
          'Email delivery is not connected in this preview, so the reset code is shown here instead of being emailed.',
      };
    }
    await save();
  }

  // Same answer whether or not the address exists.
  res.json({
    ok: true,
    message: 'If that email has an account, a reset code is on its way.',
    ...dev,
  });
});

authRouter.post('/password/reset', async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const code = String(req.body?.code ?? '').trim();
  const password = req.body?.password;
  const user = db().users.find((entry) => entry.email === email);

  if (!user || !db().resets[user.id]) {
    return fail(res, 400, 'invalid_code', 'That reset code is not valid. Request a new one.');
  }

  const record = db().resets[user.id];
  if (record.expiresAt <= Date.now()) {
    delete db().resets[user.id];
    await save();
    return fail(res, 410, 'code_expired', 'That code has expired. Request a new one.');
  }
  if (record.attempts >= 5) {
    return fail(res, 429, 'too_many_attempts', 'Too many tries. Request a new code.');
  }

  record.attempts += 1;
  if (hashShortCode(code) !== record.hash) {
    await save();
    return fail(res, 400, 'invalid_code', 'That reset code is not valid. Request a new one.');
  }

  const problem = passwordProblem(password);
  if (problem) return fail(res, 400, 'weak_password', problem);

  user.passwordHash = await hashPassword(password);
  user.emailVerified = user.emailVerified || true;
  delete db().resets[user.id];
  // A password reset signs the account out everywhere except this browser.
  db().sessions = db().sessions.filter((entry) => entry.userId !== user.id);

  const session = createSession(user.id, req);
  setSessionCookie(res, session.token, req);
  await save();

  res.json({ ok: true, user: publicUser(user) });
});

authRouter.get('/devices', requireUser, (req, res) => {
  const devices = db()
    .sessions.filter(
      (entry) => entry.userId === req.user.id && entry.expiresAt > Date.now(),
    )
    .sort((a, b) => b.lastSeenAt - a.lastSeenAt)
    .map((entry) => publicDevice(entry, req.session.id));

  res.json({ devices });
});

authRouter.delete('/devices/:id', requireUser, async (req, res) => {
  const device = db().sessions.find(
    (entry) => entry.id === req.params.id && entry.userId === req.user.id,
  );

  if (!device) {
    return fail(res, 404, 'device_not_found', 'That device is no longer signed in.');
  }

  revokeSession(device.id);
  await save();

  if (device.id === req.session.id) clearSessionCookie(res, req);
  res.json({ ok: true, signedOutHere: device.id === req.session.id });
});

