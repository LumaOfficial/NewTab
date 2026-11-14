/** Stable identifier for this browser profile, sent with every API call. */
const DEVICE_KEY = 'luma.device.v1';

export interface DeviceIdentity {
  id: string;
  label: string;
}

let cached: DeviceIdentity | null = null;

function randomId(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function readStoredId(): string {
  try {
    const raw = localStorage.getItem(DEVICE_KEY);
    if (!raw) return '';
    const parsed = JSON.parse(raw) as { id?: unknown };
    return typeof parsed.id === 'string' ? parsed.id : '';
  } catch {
    return '';
  }
}

function writeStoredId(id: string) {
  try {
    localStorage.setItem(DEVICE_KEY, JSON.stringify({ id }));
  } catch {
    // Storage unavailable: the session still works, device naming is just generic.
  }
}

function describeBrowser(): string {
  const ua = typeof navigator === 'undefined' ? '' : navigator.userAgent;
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

export function deviceIdentity(): DeviceIdentity {
  if (cached) return cached;

  let id = readStoredId();
  if (!id) {
    id = randomId();
    writeStoredId(id);
  }

  cached = { id, label: describeBrowser() };
  return cached;
}

export function deviceHeaders(): Record<string, string> {
  const device = deviceIdentity();
  return { 'X-Luma-Device-Id': device.id, 'X-Luma-Device-Label': device.label };
}
