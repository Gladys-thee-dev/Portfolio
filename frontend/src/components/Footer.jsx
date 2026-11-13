import { memo } from 'react';

function Footer({ profile }) {
  return (
    <footer className="site-footer">
      <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        <p className="mb-0">
          © {new Date().getFullYear()} {profile.name}
        </p>
        <ul className="list-unstyled d-flex gap-3 mb-0">
          {profile.links.map((l) => (
            <li key={l.id}>
              <a href={l.url} target="_blank" rel="noopener noreferrer" aria-label={`${l.label} (opens in a new tab)`}>
                <i className={`bi ${l.icon}`} aria-hidden="true" />
              </a>
            </li>
          ))}
          <li>
            <a href="#top" aria-label="Back to top">
              <i className="bi bi-arrow-up" aria-hidden="true" />
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}

export default memo(Footer);
