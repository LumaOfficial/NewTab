import { APP_NAME, APP_TAGLINE, APP_VERSION } from '../../lib/meta.js';

const FACTS = [
  ['Manifest V3', 'Built for Opera today, Chrome and Edge next.'],
  ['Works offline', 'The dashboard and your data load without a network.'],
  ['Local-first', 'Shortcuts, notes and tasks never leave this browser.'],
  ['Modular', 'Widgets, themes and settings are designed to grow.'],
];

export function AboutSection() {
  return (
    <section className="section">
      <header className="section__head">
        <h3>About {APP_NAME}</h3>
        <p>{APP_TAGLINE}</p>
      </header>

      <div className="section__card about">
        <div className="about__brand">
          <span className="brand__mark brand__mark--lg" aria-hidden="true" />
          <div>
            <h4>{APP_NAME}</h4>
            <p>Version {APP_VERSION}</p>
          </div>
        </div>
        <p className="about__text">
          Luma New Tab is an original product: its design, branding and code are its own. This foundation release focuses on a
          stable dashboard, local storage and an expandable widget system.
        </p>
      </div>

      <div className="section__card">
        {FACTS.map(([title, text]) => (
          <div className="row" key={title}>
            <div className="row__text">
              <h4>{title}</h4>
              <p>{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
