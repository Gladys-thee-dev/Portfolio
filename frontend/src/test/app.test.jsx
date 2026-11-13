import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import data from '../../../db.json';
import App from '../App';
import { intersect } from './observers';

describe('App renders everything from db.json', () => {
  it('shows the profile, stats, every role, project and credential', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: data.profile.name })).toBeInTheDocument();
    for (const s of data.stats) expect(screen.getByText(s.value)).toBeInTheDocument();
    for (const job of data.experience) expect(screen.getByRole('heading', { name: job.role })).toBeInTheDocument();
    for (const p of data.projects) {
      expect(screen.getByRole('heading', { name: p.name })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: new RegExp(`View ${p.name} on GitHub`) })).toHaveAttribute('href', p.repo);
    }
    for (const r of data.recognition) expect(screen.getByRole('heading', { name: r.title })).toBeInTheDocument();
    for (const e of data.education) expect(screen.getByRole('heading', { name: e.degree })).toBeInTheDocument();
    expect(screen.getByText('Confidential AI-training clients')).toBeInTheDocument();
  });

  it('does not render an email address or mailto/tel link anywhere', () => {
    const { container } = render(<App />);
    expect(container.querySelector('a[href^="mailto:"], a[href^="tel:"]')).toBeNull();
    expect(container.textContent).not.toMatch(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
  });

  it('opens external links safely in a new tab', () => {
    const { container } = render(<App />);
    for (const a of container.querySelectorAll('a[target="_blank"]')) {
      expect(a.getAttribute('rel')).toContain('noopener');
    }
  });
});

describe('focus filter', () => {
  it('dims items outside the chosen area, reports counts and toggles back', async () => {
    const user = userEvent.setup();
    render(<App />);
    const group = screen.getByRole('group', { name: 'Filter by focus area' });
    const quant = within(group).getByRole('button', { name: /Quant finance & math/ });

    await user.click(quant);
    expect(quant).toHaveAttribute('aria-pressed', 'true');
    // eval-studio is not tagged quant, quantprice is
    const evalStudio = screen.getByRole('heading', { name: 'eval-studio' }).closest('article');
    const quantprice = screen.getByRole('heading', { name: 'quantprice' }).closest('article');
    expect(evalStudio).toHaveClass('is-dimmed');
    expect(quantprice).not.toHaveClass('is-dimmed');
    const roles = data.experience.filter((j) => j.areas.includes('quant')).length;
    expect(screen.getByText(`${roles} roles and 1 project match`)).toBeInTheDocument();

    await user.click(quant); // clicking the active chip resets the filter
    expect(screen.getByText('Showing everything')).toBeInTheDocument();
    expect(evalStudio).not.toHaveClass('is-dimmed');
  });
});

describe('experience', () => {
  it('collapses long highlight lists and expands on demand', async () => {
    const user = userEvent.setup();
    render(<App />);
    const first = data.experience[0];
    const article = screen.getByRole('heading', { name: first.role }).closest('article');
    expect(within(article).getAllByRole('listitem')).toHaveLength(3);
    await user.click(within(article).getByRole('button', { name: `Show ${first.highlights.length - 3} more` }));
    expect(within(article).getAllByRole('listitem')).toHaveLength(first.highlights.length);
  });
});

describe('navigation and theme', () => {
  it('marks the section in view as current', () => {
    render(<App />);
    intersect(document.getElementById('projects'));
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute('aria-current', 'location');
  });

  it('closes the mobile menu when a link is clicked (one delegated handler)', async () => {
    const user = userEvent.setup();
    render(<App />);
    const toggle = screen.getByRole('button', { name: 'Open menu' });
    await user.click(toggle);
    expect(document.getElementById('site-menu')).toHaveClass('show');
    await user.click(screen.getByRole('link', { name: 'Education' }));
    expect(document.getElementById('site-menu')).not.toHaveClass('show');
  });

  it('toggles and remembers the theme', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Switch to dark theme' }));
    expect(document.documentElement).toHaveAttribute('data-bs-theme', 'dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('reveals sections when they scroll into view', () => {
    render(<App />);
    const head = document.querySelector('#recognition .section-head');
    expect(head).not.toHaveClass('is-visible');
    intersect(head);
    expect(head).toHaveClass('is-visible');
  });
});

describe('contact form', () => {
  const fill = async (user, { name = 'Ada Lovelace', email = 'ada@example.com', message = 'We are hiring math evaluators.' } = {}) => {
    if (name) await user.type(screen.getByLabelText('Name'), name);
    if (email) await user.type(screen.getByLabelText('Email'), email);
    if (message) await user.type(screen.getByLabelText('Message'), message);
  };

  it('shows field errors and focuses the first one instead of sending', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    render(<App />);
    await user.click(screen.getByRole('button', { name: /Send message/ }));
    expect(screen.getByText('Please enter your name.')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveFocus();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('posts a Netlify Forms body and confirms', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal('fetch', fetchMock);
    render(<App />);
    await fill(user);
    await user.click(screen.getByRole('button', { name: /Send message/ }));
    expect(await screen.findByText('Thank you. Your message has been sent.')).toBeInTheDocument();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/');
    expect(init.headers['Content-Type']).toBe('application/x-www-form-urlencoded');
    const body = new URLSearchParams(init.body);
    expect(body.get('form-name')).toBe('contact');
    expect(body.get('email')).toBe('ada@example.com');
    expect(body.get('bot-field')).toBe('');
    expect(screen.getByLabelText('Name')).toHaveValue('');
  });

  it('reports a failed send without losing what was typed', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    render(<App />);
    await fill(user);
    await user.click(screen.getByRole('button', { name: /Send message/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('could not be sent');
    expect(screen.getByLabelText('Name')).toHaveValue('Ada Lovelace');
  });

  it('matches the hidden Netlify form registered in index.html', async () => {
    const { readFileSync } = await import('node:fs');
    const { resolve } = await import('node:path');
    const html = readFileSync(resolve(__dirname, '../../index.html'), 'utf8');
    for (const field of ['name', 'email', 'company', 'message', 'bot-field']) {
      expect(html).toContain(`name="${field}"`);
    }
    expect(html).toContain('form name="contact" data-netlify="true" netlify-honeypot="bot-field"');
  });
});
