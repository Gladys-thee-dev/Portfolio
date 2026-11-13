import { memo, useRef, useState } from 'react';
import { LIMITS, encodeForm, validateMessage } from '../lib/validation';
import Section from './Section';

// Contact details are deliberately not shown. Messages go through Netlify Forms (the
// hidden form in index.html registers the fields at deploy time) and arrive in Gladys's
// Netlify dashboard and inbox.
export const FORM_NAME = 'contact';
const EMPTY = { name: '', email: '', company: '', message: '', 'bot-field': '' };
const ORDER = ['name', 'email', 'company', 'message'];

function Field({ name, label, error, children }) {
  return (
    <div className="mb-3">
      <label htmlFor={`contact-${name}`} className="form-label fw-semibold">
        {label}
      </label>
      {children}
      {error && (
        <div id={`contact-${name}-error`} className="invalid-feedback d-block">
          {error}
        </div>
      )}
    </div>
  );
}

function Contact({ profile }) {
  const formRef = useRef(null);
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error

  const onChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors(({ [name]: _removed, ...rest }) => rest);
    if (status === 'sent' || status === 'error') setStatus('idle');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const found = validateMessage(values);
    if (Object.keys(found).length) {
      setErrors(found);
      const first = ORDER.find((f) => found[f]);
      formRef.current?.elements.namedItem(first)?.focus();
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodeForm(FORM_NAME, values),
      });
      if (!res.ok) throw new Error(String(res.status));
      setValues(EMPTY);
      setErrors({});
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  const field = (name) => ({
    id: `contact-${name}`,
    name,
    value: values[name],
    onChange,
    className: `form-control ${errors[name] ? 'is-invalid' : ''}`,
    'aria-invalid': errors[name] ? 'true' : undefined,
    'aria-describedby': errors[name] ? `contact-${name}-error` : undefined,
  });

  const firstName = profile.name.split(' ')[0];

  return (
    <Section
      id="contact"
      eyebrow="Contact"
      title={`Work with ${firstName}`}
      lead="Hiring for AI training, evaluation or red-teaming? Send a message and it goes straight to Gladys."
      className="section-contact"
    >
      <div className="row g-5 align-items-start">
        <div className="col-lg-5">
          <ul className="list-unstyled d-grid gap-3 mb-4">
            <li className="contact-point">
              <i className="bi bi-clipboard2-check" aria-hidden="true" />
              <span>LLM evaluation, RLHF and SFT data, rubric design</span>
            </li>
            <li className="contact-point">
              <i className="bi bi-calculator" aria-hidden="true" />
              <span>Expert math, finance and code benchmarks</span>
            </li>
            <li className="contact-point">
              <i className="bi bi-shield-lock" aria-hidden="true" />
              <span>Red teaming and safety-policy scoring</span>
            </li>
            <li className="contact-point">
              <i className="bi bi-globe-americas" aria-hidden="true" />
              <span>
                {profile.region} · {profile.workMode}
              </span>
            </li>
          </ul>
          <p className="small text-body-secondary mb-2">Or find Gladys on</p>
          <div className="d-flex gap-2">
            {profile.links.map((l) => (
              <a key={l.id} className="btn btn-outline-royal" href={l.url} target="_blank" rel="noopener noreferrer">
                <i className={`bi ${l.icon} me-2`} aria-hidden="true" />
                {l.label}
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            ))}
          </div>
        </div>
        <div className="col-lg-7">
          <form
            ref={formRef}
            name={FORM_NAME}
            className="contact-form"
            noValidate
            onSubmit={onSubmit}
            aria-label="Contact form"
          >
            <div className="row g-0 gx-md-3">
              <div className="col-md-6">
                <Field name="name" label="Name" error={errors.name}>
                  <input type="text" autoComplete="name" maxLength={LIMITS.name.max} {...field('name')} />
                </Field>
              </div>
              <div className="col-md-6">
                <Field name="email" label="Email" error={errors.email}>
                  <input type="email" autoComplete="email" maxLength={LIMITS.email.max} {...field('email')} />
                </Field>
              </div>
            </div>
            <Field name="company" label="Company (optional)" error={errors.company}>
              <input type="text" autoComplete="organization" maxLength={LIMITS.company.max} {...field('company')} />
            </Field>
            <Field name="message" label="Message" error={errors.message}>
              <textarea rows={5} maxLength={LIMITS.message.max} {...field('message')} />
            </Field>
            <div className="visually-hidden" aria-hidden="true">
              <label htmlFor="contact-bot-field">Leave this field empty</label>
              <input id="contact-bot-field" name="bot-field" tabIndex={-1} autoComplete="off" value={values['bot-field']} onChange={onChange} />
            </div>
            <div aria-live="polite">
              {status === 'sent' && (
                <div className="alert alert-success d-flex align-items-center gap-2" role="status">
                  <i className="bi bi-check-circle-fill" aria-hidden="true" />
                  Thank you. Your message has been sent.
                </div>
              )}
              {status === 'error' && (
                <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
                  <i className="bi bi-exclamation-triangle-fill" aria-hidden="true" />
                  The message could not be sent. Please try again, or reach Gladys on LinkedIn.
                </div>
              )}
            </div>
            <button type="submit" className="btn btn-royal btn-lg w-100" disabled={status === 'sending'}>
              {status === 'sending' ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                  Sending…
                </>
              ) : (
                <>
                  <i className="bi bi-send me-2" aria-hidden="true" />
                  Send message
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </Section>
  );
}

export default memo(Contact);
