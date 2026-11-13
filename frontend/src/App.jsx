import { useCallback, useMemo, useState } from 'react';
import data from '../../db.json';
import About from './components/About';
import Contact from './components/Contact';
import Education from './components/Education';
import Experience from './components/Experience';
import Expertise from './components/Expertise';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Navbar from './components/Navbar';
import Projects from './components/Projects';
import Recognition from './components/Recognition';
import { useScrollProgress } from './hooks/useScrollProgress';
import { useTheme } from './hooks/useTheme';
import { ALL, buildAreaIndex } from './lib/indexes';

// db.json is imported at build time: the content ships inside the JS bundle, so there is
// no request, no loading state and no layout shift while data arrives.
export default function App({ content = data }) {
  const [theme, toggleTheme] = useTheme();
  const [focus, setFocus] = useState(ALL);
  const progressRef = useScrollProgress();
  const index = useMemo(() => buildAreaIndex(content), [content]); // O(total tags), once
  const onFocus = useCallback((id) => setFocus((cur) => (cur === id ? ALL : id)), []);

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Navbar profile={content.profile} theme={theme} onToggleTheme={toggleTheme} progressRef={progressRef} />
      <main id="main">
        <Hero profile={content.profile} stats={content.stats} />
        <About profile={content.profile} education={content.education} />
        <Expertise areas={content.focusAreas} skills={content.skills} index={index} focus={focus} onFocus={onFocus} />
        <Experience experience={content.experience} index={index} focus={focus} />
        <Projects projects={content.projects} index={index} focus={focus} />
        <Recognition items={content.recognition} />
        <Education education={content.education} certifications={content.certifications} />
        <Contact profile={content.profile} />
      </main>
      <Footer profile={content.profile} />
    </>
  );
}
