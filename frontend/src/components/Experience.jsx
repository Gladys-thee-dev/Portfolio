import { memo, useMemo, useState } from 'react';
import { durationLabel, formatRange } from '../lib/format';
import { matcher } from '../lib/indexes';
import Section, { Reveal } from './Section';

const COLLAPSED = 3; // highlights shown before "Show more"

function Role({ job, dimmed }) {
  const [expanded, setExpanded] = useState(false);
  const extra = job.highlights.length - COLLAPSED;
  const shown = expanded ? job.highlights : job.highlights.slice(0, COLLAPSED);
  const listId = `${job.id}-highlights`;
  return (
    <article className={`role ${dimmed ? 'is-dimmed' : ''}`}>
      <span className="role-dot" aria-hidden="true" />
      <header className="role-head">
        <div>
          <h3 className="role-title">{job.role}</h3>
          <p className="role-org">
            {job.org}
            {job.type && <span className="badge-soft ms-2">{job.type}</span>}
          </p>
        </div>
        <p className="role-dates">
          <span>{formatRange(job.start, job.end)}</span>
          <span className="role-duration">{durationLabel(job.start, job.end)}</span>
          <span className="role-location">
            <i className="bi bi-geo-alt me-1" aria-hidden="true" />
            {job.location}
          </span>
        </p>
      </header>
      <ul id={listId} className="role-list">
        {shown.map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>
      {extra > 0 && (
        <button
          type="button"
          className="btn btn-link btn-sm px-0 role-more"
          aria-expanded={expanded}
          aria-controls={listId}
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? 'Show less' : `Show ${extra} more`}
          <i className={`bi ${expanded ? 'bi-chevron-up' : 'bi-chevron-down'} ms-1`} aria-hidden="true" />
        </button>
      )}
    </article>
  );
}

function Experience({ experience, index, focus }) {
  const matches = useMemo(() => matcher(index, focus, 'experience'), [index, focus]);
  return (
    <Section id="experience" eyebrow="Experience" title="Evaluation, research and production engineering">
      <div className="timeline">
        {experience.map((job, i) => (
          <Reveal key={job.id} delay={Math.min(i, 3) * 60}>
            <Role job={job} dimmed={!matches(job.id)} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

export default memo(Experience);
