/** Placeholder panel for functionality that is explicitly planned, not built. */
export function ComingSoonSection({ title, summary, bullets = [] }) {
  return (
    <section className="section">
      <header className="section__head">
        <h3>
          {title} <span className="pill">Coming later</span>
        </h3>
        <p>{summary}</p>
      </header>

      <div className="section__card">
        <p className="section__empty">
          This section is reserved for a future update. Nothing here is active yet — Luma New Tab currently stores everything
          locally and works offline.
        </p>
        <ul className="planned-list">
          {bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
