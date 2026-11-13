import { memo } from 'react';
import Section, { Reveal } from './Section';

function Recognition({ items }) {
  return (
    <Section id="recognition" eyebrow="Recognition" title="Awards, talks and peer review" className="section-alt">
      <div className="row g-4">
        {items.map((r, i) => (
          <Reveal key={r.id} className="col-md-4" delay={i * 80}>
            <article className="honor-card">
              <i className={`bi ${r.icon} honor-icon`} aria-hidden="true" />
              <h3 className="honor-title">{r.title}</h3>
              <p className="honor-org">
                {r.org}
                {r.year && <span className="honor-year"> · {r.year}</span>}
              </p>
              {r.detail && <p className="honor-detail">{r.detail}</p>}
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

export default memo(Recognition);
