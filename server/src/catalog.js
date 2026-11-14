/**
 * Provider catalogue.
 *
 * One source of truth for the social sign-in buttons and the integrations
 * page: label, what it asks for, how it authenticates, and which environment
 * variables it needs. Nothing here claims a connection exists — status is
 * always resolved per user at request time.
 */

export const SOCIAL_PROVIDERS = [
  {
    id: 'google',
    label: 'Google',
    env: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
    authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://openidconnect.googleapis.com/v1/userinfo',
    scope: 'openid email profile',
  },
  {
    id: 'microsoft',
    label: 'Microsoft',
    env: ['MICROSOFT_CLIENT_ID', 'MICROSOFT_CLIENT_SECRET'],
    authorizeUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
    scope: 'openid email profile User.Read',
  },
  {
    id: 'apple',
    label: 'Apple',
    env: ['APPLE_CLIENT_ID', 'APPLE_CLIENT_SECRET'],
    authorizeUrl: 'https://appleid.apple.com/auth/authorize',
    tokenUrl: 'https://appleid.apple.com/auth/token',
    userInfoUrl: null,
    scope: 'name email',
    note: 'Apple needs a Services ID plus a signing key issued by Apple before sign-in can run.',
  },
];

/**
 * `kind` decides how a connection is made:
 *  - `oauth`     redirect to the provider and store its tokens server-side
 *  - `api-key`   service credential configured by the Luma operator
 *  - `browser`   needs an extension permission that this phase does not request
 *  - `links`     quick links only, nothing to connect
 */
export const INTEGRATIONS = [
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    category: 'Calendar',
    kind: 'oauth',
    oauth: 'google',
    scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    permissions: 'Read the calendars and events you choose. No editing, no email access.',
    summary: 'See today’s events on your new tab (calendar widget arrives later).',
  },
  {
    id: 'outlook-calendar',
    name: 'Microsoft Outlook Calendar',
    category: 'Calendar',
    kind: 'oauth',
    oauth: 'microsoft',
    scopes: ['Calendars.Read'],
    permissions: 'Read your calendars and events. Nothing is written back to Outlook.',
    summary: 'Bring Outlook events to the same agenda view as Google Calendar.',
  },
  {
    id: 'spotify',
    name: 'Spotify',
    category: 'Music',
    kind: 'oauth',
    oauth: 'spotify',
    scopes: ['user-read-playback-state', 'user-read-currently-playing'],
    permissions: 'See what is playing and control playback. Your library stays private.',
    summary: 'Show and control the track that is currently playing.',
  },
  {
    id: 'youtube-music',
    name: 'YouTube Music',
    category: 'Music',
    kind: 'oauth',
    oauth: 'google',
    scopes: ['https://www.googleapis.com/auth/youtube.readonly'],
    permissions: 'Read your YouTube account basics and playlists. No uploads or edits.',
    summary: 'Surface recent listens and quick playback links.',
  },
  {
    id: 'weather',
    name: 'Weather',
    category: 'Environment',
    kind: 'api-key',
    env: ['WEATHER_API_KEY'],
    permissions: 'A location you choose, sent to a weather service to fetch the forecast.',
    summary: 'A small forecast card for your city.',
  },
  {
    id: 'email-preview',
    name: 'Email preview',
    category: 'Communication',
    kind: 'oauth',
    oauth: 'google',
    scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
    permissions: 'Read message headers and snippets only. Messages cannot be sent or deleted.',
    summary: 'A quiet inbox glance — subject lines, never full message bodies.',
  },
  {
    id: 'contacts',
    name: 'Contacts',
    category: 'Communication',
    kind: 'oauth',
    oauth: 'google',
    scopes: ['https://www.googleapis.com/auth/contacts.readonly'],
    permissions: 'Read your saved contacts to make search find people faster.',
    summary: 'Find a person from the search bar.',
  },
  {
    id: 'bookmarks',
    name: 'Browser bookmarks',
    category: 'Browser',
    kind: 'browser',
    permission: 'bookmarks',
    permissions: 'The extension would need the browser’s bookmarks permission.',
    summary: 'Turn bookmark folders into shortcut groups.',
    unavailableReason:
      'Not enabled in this phase: Luma only asks for the storage permission today. Connecting this later adds the bookmarks permission.',
  },
  {
    id: 'history',
    name: 'Browser history',
    category: 'Browser',
    kind: 'browser',
    permission: 'history',
    permissions: 'The extension would need the browser’s history permission.',
    summary: 'Suggest the pages you actually return to.',
    unavailableReason:
      'Not enabled in this phase: Luma only asks for the storage permission today. Connecting this later adds the history permission.',
  },
  {
    id: 'messaging',
    name: 'Messaging quick links',
    category: 'Communication',
    kind: 'links',
    permissions: 'Nothing — these are plain links you choose to pin.',
    summary: 'Pin WhatsApp Web, Slack, Signal or any chat you use in the browser.',
  },
];

export const INTEGRATION_IDS = INTEGRATIONS.map((entry) => entry.id);

export function credentialsFor(providerId) {
  const source =
    providerId === 'spotify'
      ? { env: ['SPOTIFY_CLIENT_ID', 'SPOTIFY_CLIENT_SECRET'] }
      : SOCIAL_PROVIDERS.find((entry) => entry.id === providerId);

  if (!source) return null;

  const [idName, secretName] = source.env;
  const clientId = process.env[idName] ?? '';
  const clientSecret = process.env[secretName] ?? '';

  return { clientId, clientSecret, configured: Boolean(clientId && clientSecret), env: source.env };
}

export function socialProvider(id) {
  return SOCIAL_PROVIDERS.find((entry) => entry.id === id) ?? null;
}

export function integration(id) {
  return INTEGRATIONS.find((entry) => entry.id === id) ?? null;
}

export function oauthEndpoints(providerId) {
  if (providerId === 'spotify') {
    return {
      authorizeUrl: 'https://accounts.spotify.com/authorize',
      tokenUrl: 'https://accounts.spotify.com/api/token',
      userInfoUrl: 'https://api.spotify.com/v1/me',
    };
  }
  const provider = socialProvider(providerId);
  if (!provider) return null;
  return {
    authorizeUrl: provider.authorizeUrl,
    tokenUrl: provider.tokenUrl,
    userInfoUrl: provider.userInfoUrl,
  };
}
