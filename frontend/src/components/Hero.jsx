import { memo } from 'react';
import { useRotatingText } from '../hooks/useRotatingText';

function Hero({ profile, stats }) {
  const rotatingRef = useRotatingText(profile.rotating);
  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <div className="hero-bg" aria-hidden="true" />
      <div className="container position-relative">
        <div className="row align-items-center g-5">
          <div className="col-lg-7">
            <p className="hero-badge">
              <span className="status-dot" aria-hidden="true" />
              {profile.availability}
            </p>
            <h1 id="hero-title" className="hero-title">
              {profile.name}
            </h1>
            <p className="hero-role tw-text-balance">
              {profile.title} <span className="hero-role-sep" aria-hidden="true">·</span>{' '}
              <span className="hero-role-accent">{profile.headline}</span>
            </p>
            <p className="hero-tagline tw-text-pretty">{profile.tagline}</p>
            <p className="hero-rotating" aria-hidden="true">
              <i className="bi bi-stars me-2" />
              Specialising in <span ref={rotatingRef} className="hero-rotating-word">{profile.rotating[0]}</span>
            </p>
            <p className="visually-hidden">Specialising in {profile.rotating.join(', ')}.</p>
            <div className="d-flex flex-wrap gap-3 mt-4">
              <a href="#projects" className="btn btn-royal btn-lg">
                <i className="bi bi-grid-1x2 me-2" aria-hidden="true" />
                View projects
              </a>
              <a href="#contact" className="btn btn-outline-light btn-lg">
                <i className="bi bi-send me-2" aria-hidden="true" />
                Get in touch
              </a>
            </div>
            <ul className="hero-links list-unstyled d-flex gap-3 mt-4 mb-0">
              {profile.links.map((l) => (
                <li key={l.id}>
                  <a href={l.url} target="_blank" rel="noopener noreferrer" aria-label={`${l.label} (opens in a new tab)`}>
                    <i className={`bi ${l.icon}`} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-lg-5">
            <dl className="stat-grid">
              {stats.map((s) => (
                <div key={s.label} className="stat-card">
                  <i className={`bi ${s.icon} stat-icon`} aria-hidden="true" />
                  <dt className="stat-label">{s.label}</dt>
                  <dd className="stat-value">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(Hero);
