import { memo, useMemo } from 'react';
import { matcher } from '../lib/indexes';
import Section, { Reveal } from './Section';

function Projects({ projects, index, focus }) {
  const matches = useMemo(() => matcher(index, focus, 'projects'), [index, focus]);
  return (
    <Section
      id="projects"
      eyebrow="Projects"
      title="Open-source work"
      lead="Public repositories, tested in CI. Each README states what the code does not handle."
    >
      <div className="row g-4">
        {projects.map((p, i) => (
          <Reveal key={p.id} className="col-lg-6" delay={i * 100}>
            <article className={`project-card ${matches(p.id) ? '' : 'is-dimmed'}`}>
              <header className="d-flex align-items-start gap-3 mb-3">
                <span className="project-icon" aria-hidden="true">
                  <i className={`bi ${p.icon}`} />
                </span>
                <div>
                  <h3 className="project-name">{p.name}</h3>
                  <p className="project-kind">{p.kind}</p>
                </div>
              </header>
              <p className="project-summary tw-text-pretty">{p.summary}</p>
              <ul className="project-list">
                {p.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
              <ul className="tag-list mt-auto" aria-label={`${p.name} technologies`}>
                {p.tech.map((t) => (
                  <li key={t} className="tag tag-outline">
                    {t}
                  </li>
                ))}
              </ul>
              <a className="project-link" href={p.repo} target="_blank" rel="noopener noreferrer">
                <i className="bi bi-github me-2" aria-hidden="true" />
                View {p.name} on GitHub
                <span className="visually-hidden"> (opens in a new tab)</span>
                <i className="bi bi-arrow-up-right ms-1" aria-hidden="true" />
              </a>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

export default memo(Projects);
