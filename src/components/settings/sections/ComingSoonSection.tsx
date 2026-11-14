import { FUTURE_SECTIONS } from '../futureSections';
import type { SettingsSectionId } from '../sections';
import { Badge } from '../../ui/Badge';

export function ComingSoonSection({ sectionId }: { sectionId: SettingsSectionId }) {
  const content = FUTURE_SECTIONS[sectionId];
  if (!content) return null;

  return (
    <section className="settings__section" aria-labelledby={`settings-${sectionId}`}>
      <div>
        <div className="settings__title-row">
          <span className="settings__section-icon">{content.icon}</span>
          <h3 className="settings__section-title" id={`settings-${sectionId}`}>
            {content.title}
          </h3>
          <Badge>Coming later</Badge>
        </div>
        <p className="settings__section-intro">{content.description}</p>
      </div>

      <div className="future-section">
        <p className="reset-note">
          This section is reserved for a future update. Nothing here is active yet, and Luma
          makes no network requests in this release.
        </p>
        {content.planned.map((item) => (
          <div key={item} className="future-item">
            <span className="future-item__text">
              <span className="future-item__label">{item}</span>
            </span>
            <Badge muted>Planned</Badge>
          </div>
        ))}
      </div>
    </section>
  );
}
