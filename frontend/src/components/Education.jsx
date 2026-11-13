import { memo } from 'react';
import Section, { Reveal } from './Section';

function Education({ education, certifications }) {
  return (
    <Section id="education" eyebrow="Education" title="Training in finance, computing and data">
      <div className="row g-4">
        <div className="col-lg-8">
          <ol className="list-unstyled d-grid gap-3 mb-0">
            {education.map((e, i) => (
              <Reveal as="li" key={e.id} className="edu-card" delay={i * 80}>
                <div className="d-flex justify-content-between flex-wrap gap-2">
                  <h3 className="edu-degree">{e.degree}</h3>
                  <span className="edu-years">
                    {e.start}–{e.end}
                  </span>
                </div>
                <p className="edu-school">
                  {e.school} · {e.location}
                  {e.note && <span className="badge-soft ms-2">{e.note}</span>}
                </p>
                {e.detail && <p className="edu-detail">{e.detail}</p>}
              </Reveal>
            ))}
          </ol>
        </div>
        <Reveal className="col-lg-4" delay={120}>
          <div className="cert-card">
            <h3 className="cert-title">
              <i className="bi bi-patch-check me-2" aria-hidden="true" />
              Certifications
            </h3>
            <ul className="list-unstyled d-grid gap-2 mb-0">
              {certifications.map((c) => (
                <li key={c.id} className="cert-item">
                  <span>{c.name}</span>
                  <span className="cert-year">{c.year}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

export default memo(Education);
