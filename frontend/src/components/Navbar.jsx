import { memo, useState } from 'react';
import { useActiveSection } from '../hooks/useActiveSection';

export const NAV = [
  { id: 'about', label: 'About' },
  { id: 'expertise', label: 'Expertise' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'recognition', label: 'Recognition' },
  { id: 'education', label: 'Education' },
  { id: 'contact', label: 'Contact' },
];
const IDS = NAV.map((n) => n.id);

function Navbar({ profile, theme, onToggleTheme, progressRef }) {
  const [open, setOpen] = useState(false);
  const active = useActiveSection(IDS);

  // Event delegation: one handler on the list instead of one per link.
  const onListClick = (e) => {
    if (e.target.closest('a')) setOpen(false);
  };

  return (
    <header className="site-nav">
      <nav className="navbar navbar-expand-lg" aria-label="Main">
        <div className="container">
          <a className="navbar-brand brand" href="#top" title="Back to top">
            <span className="brand-mark" aria-hidden="true">
              {profile.initials}
            </span>
            <span className="brand-name">{profile.shortName}</span>
          </a>
          <div className="d-flex align-items-center gap-2 order-lg-last">
            <button
              type="button"
              className="btn btn-icon"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              <i className={`bi ${theme === 'dark' ? 'bi-sun' : 'bi-moon-stars'}`} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="btn btn-icon d-lg-none"
              aria-controls="site-menu"
              aria-expanded={open}
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((o) => !o)}
            >
              <i className={`bi ${open ? 'bi-x-lg' : 'bi-list'}`} aria-hidden="true" />
            </button>
          </div>
          <div id="site-menu" className={`collapse navbar-collapse ${open ? 'show' : ''}`}>
            <ul className="navbar-nav ms-lg-auto me-lg-3" onClick={onListClick}>
              {NAV.map((n) => (
                <li key={n.id} className="nav-item">
                  <a
                    className={`nav-link ${active === n.id ? 'active' : ''}`}
                    aria-current={active === n.id ? 'location' : undefined}
                    href={`#${n.id}`}
                  >
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>
      <div className="scroll-progress" aria-hidden="true">
        <span ref={progressRef} />
      </div>
    </header>
  );
}

export default memo(Navbar);
