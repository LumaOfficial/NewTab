import { useEffect, useState } from 'react';
import { getWidget, type WidgetIntegrationId } from '../catalogue';
import { WidgetCard } from '../WidgetCard';
import { IntegrationSetup } from '../WidgetStates';
import { VolumeIcon } from '../../components/icons';
import { useWidgetState } from '../hooks';
import type { WidgetProps } from '../types';

const INTEGRATION_COPY: Record<WidgetIntegrationId, string> = {
  'google-calendar': 'Connect Google Calendar in Integrations to see events.',
  'outlook-calendar': 'Connect Outlook Calendar in Integrations to see events.',
  spotify: 'Connect Spotify in Integrations to see and control playback. Luma only asks to read what is playing.',
  'youtube-music': 'Connect YouTube Music in Integrations to control playback.',
  weather: 'Weather needs the Luma weather service configured on the account server.',
  'email-preview': 'Connect a mailbox in Integrations to preview messages.',
  contacts: 'Connect contacts in Integrations to see people here.',
  messaging: 'Messaging apps open as links; nothing is connected.',
  news: 'Headlines need a connected news service.',
  rss: 'Add a feed URL in this widget’s settings to load a feed.',
  stocks: 'Market data needs a connected market service.',
  crypto: 'Coin prices need a connected market service.',
  sports: 'Scores need a connected sports service.',
  transit: 'Transit times need a connected transit service.',
};

export function MediaIntegrationWidget({ widgetId, openAccount }: WidgetProps) {
  const descriptor = getWidget(widgetId);
  if (!descriptor) return null;
  const integration = descriptor.integration ?? 'spotify';

  return (
    <WidgetCard title={descriptor.title}>
      <IntegrationSetup
        service={descriptor.title}
        text={INTEGRATION_COPY[integration]}
        onOpenIntegrations={() => openAccount('integrations')}
      />
    </WidgetCard>
  );
}

/* ---------------------------------------------------------------------- Volume */

interface VolumeState extends Record<string, unknown> {
  level: number;
}

export function VolumeWidget() {
  const [state, setState] = useWidgetState<VolumeState>('volume', { level: 60 });
  const [sources, setSources] = useState<HTMLMediaElement[]>([]);

  useEffect(() => {
    const media = Array.from(document.querySelectorAll<HTMLMediaElement>('audio, video'));
    setSources(media);
    for (const element of media) {
      element.volume = Math.min(1, Math.max(0, state.level / 100));
    }
  }, [state.level]);

  return (
    <WidgetCard title="Volume">
      {sources.length === 0 ? (
        <p className="widget-hint">
          No audio or video is playing on this page, so there is nothing to control yet. Add a media
          embed to use this slider.
        </p>
      ) : (
        <div className="volume">
          <VolumeIcon size={18} />
          <input
            type="range"
            min={0}
            max={100}
            value={state.level}
            aria-label="Media volume"
            onChange={(event) => setState({ level: Number(event.target.value) })}
          />
          <span>{state.level}%</span>
        </div>
      )}
    </WidgetCard>
  );
}

