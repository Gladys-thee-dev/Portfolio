import { useReveal } from '../hooks/useReveal';

export default function Section({ id, eyebrow, title, lead, className = '', children }) {
  const ref = useReveal();
  return (
    <section id={id} className={`section ${className}`} aria-labelledby={`${id}-title`}>
      <div className="container">
        <header ref={ref} className="section-head reveal">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2 id={`${id}-title`} className="section-title tw-text-balance">
            {title}
          </h2>
          {lead && <p className="section-lead tw-text-pretty">{lead}</p>}
        </header>
        {children}
      </div>
    </section>
  );
}

/** Wraps a block so it fades in once when scrolled into view. */
export function Reveal({ as: Tag = 'div', className = '', delay = 0, children, ...rest }) {
  const ref = useReveal();
  return (
    <Tag ref={ref} className={`reveal ${className}`} style={delay ? { '--reveal-delay': `${delay}ms` } : undefined} {...rest}>
      {children}
    </Tag>
  );
}
