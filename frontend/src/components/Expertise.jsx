import { memo, useMemo } from 'react';
import { ALL, countMatches, matcher } from '../lib/indexes';
import Section, { Reveal } from './Section';

function FocusFilter({ areas, value, onChange, counts }) {
  return (
    <div className="focus-filter" role="group" aria-label="Filter by focus area">
      {[{ id: ALL, label: 'Everything', icon: 'bi-grid' }, ...areas].map((a) => (
        <button
          key={a.id}
          type="button"
          className={`chip ${value === a.id ? 'is-active' : ''}`}
          aria-pressed={value === a.id}
          onClick={() => onChange(a.id)}
        >
          <i className={`bi ${a.icon} me-1`} aria-hidden="true" />
          {a.label}
        </button>
      ))}
      <p className="focus-count" aria-live="polite">
        {counts
          ? `${counts.experience} role${counts.experience === 1 ? '' : 's'} and ${counts.projects} project${counts.projects === 1 ? '' : 's'} match`
          : 'Showing everything'}
      </p>
    </div>
  );
}

function Expertise({ areas, skills, index, focus, onFocus }) {
  const matches = useMemo(() => matcher(index, focus, 'skills'), [index, focus]);
  const counts = useMemo(() => countMatches(index, focus), [index, focus]);
  return (
    <Section
      id="expertise"
      eyebrow="Expertise"
      title="Where evaluation meets deep domain knowledge"
      lead="Pick a focus area to highlight the matching skills, roles and projects across the page."
    >
      <FocusFilter areas={areas} value={focus} onChange={onFocus} counts={counts} />
      <div className="row g-4 mt-1">
        {skills.map((s, i) => {
          const on = matches(s.id);
          return (
            <Reveal key={s.id} className="col-md-6 col-xl-4" delay={(i % 3) * 80}>
              <article className={`skill-card ${on ? '' : 'is-dimmed'}`} aria-hidden={on ? undefined : 'true'}>
                <h3 className="skill-title">
                  <i className={`bi ${s.icon}`} aria-hidden="true" />
                  {s.category}
                </h3>
                <ul className="tag-list">
                  {s.items.map((item) => (
                    <li key={item} className="tag">
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}

export default memo(Expertise);
