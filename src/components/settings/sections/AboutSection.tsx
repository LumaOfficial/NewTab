import { APP_NAME, APP_VERSION, isExtensionContext } from '../../../extension/context';
import { Badge } from '../../ui/Badge';
import { LumaMark } from '../../LumaMark';

const INCLUDED = [
  'New-tab dashboard with clock, greeting, search, shortcuts, notes and tasks',
  'Light, dark and system themes',
  'Widget visibility and ordering',
  'Local storage that survives closing the browser',
];

const NOT_INCLUDED = [
  'Accounts, cloud sync and collaboration',
  'AI features and third-party integrations',
  'Advanced themes and workspaces',
];

export function AboutSection() {
  return (
    <section className="settings__section" aria-labelledby="settings-about">
      <div>
        <h3 className="settings__section-title" id="settings-about">
          About {APP_NAME}
        </h3>
        <p className="settings__section-intro">A calm, original new-tab dashboard.</p>
      </div>

      <div className="about-card">
        <div className="about-card__head">
          <LumaMark size={34} />
          <div className="about-card__name">
            <span className="about-card__title">{APP_NAME}</span>
            <span className="about-card__meta">Version {APP_VERSION} · Foundation release</span>
          </div>
        </div>
        <p>
          Luma replaces your browser’s new tab with a focused dashboard. This first release
          establishes the design system, widget framework and local storage foundation that
          later updates build on.
        </p>
        <div className="settings__title-row">
          <Badge>{isExtensionContext() ? 'Running as extension' : 'Running as web preview'}</Badge>
        </div>
      </div>

      <div className="settings__group">
        <p className="settings__group-title">In this version</p>
        <ul className="info-list">
          {INCLUDED.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="settings__group">
        <p className="settings__group-title">Planned for later</p>
        <ul className="info-list">
          {NOT_INCLUDED.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="settings__group">
        <p className="settings__group-title">Compatibility</p>
        <div className="info-block">
          <span>
            Manifest V3 extension built for Chromium browsers: Opera first, with Chrome and Edge
            supported by the same package.
          </span>
          <span>Works offline. No analytics, no remote calls, no account required.</span>
        </div>
      </div>
    </section>
  );
}
