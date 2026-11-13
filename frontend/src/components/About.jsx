import { memo } from 'react';
import Section, { Reveal } from './Section';

const PILLARS = [
  {
    icon: 'bi-bullseye',
    title: 'Benchmarks that hold up',
    text: 'Expert problems with verified solutions, unique answers and partial-credit rubrics.',
  },
  {
    icon: 'bi-search',
    title: 'Precise error analysis',
    text: 'Every judgement comes with a written explanation of exactly where and why an answer fails.',
  },
  {
    icon: 'bi-shield-check',
    title: 'Calibrated safety scoring',
    text: 'Red-teaming and policy scoring that stays consistent across raters and rounds.',
  },
];

function About({ profile, education }) {
  const phd = education[0];
  return (
    <Section id="about" eyebrow="About" title="Rigorous evaluation for models that reason">
      <div className="row g-5">
        <Reveal className="col-lg-7">
          {profile.summary.map((p) => (
            <p key={p.slice(0, 24)} className="about-text tw-text-pretty">
              {p}
            </p>
          ))}
        </Reveal>
        <Reveal className="col-lg-5" delay={120}>
          <div className="about-card">
            <div className="about-card-head">
              <i className="bi bi-mortarboard" aria-hidden="true" />
              <div>
                <p className="mb-0 fw-semibold">{phd.degree}</p>
                <p className="mb-0 text-body-secondary small">
                  {phd.school} · {phd.start}–{phd.end}
                </p>
              </div>
            </div>
            <ul className="list-unstyled mb-0 d-grid gap-3">
              {PILLARS.map((p) => (
                <li key={p.title} className="d-flex gap-3">
                  <i className={`bi ${p.icon} pillar-icon`} aria-hidden="true" />
                  <div>
                    <p className="mb-1 fw-semibold">{p.title}</p>
                    <p className="mb-0 text-body-secondary small">{p.text}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="about-meta">
              <i className="bi bi-geo-alt me-1" aria-hidden="true" />
              {profile.region} · {profile.workMode}
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

export default memo(About);
