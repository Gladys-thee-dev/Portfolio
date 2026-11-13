const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LIMITS = {
  name: { min: 2, max: 100 },
  email: { max: 254 },
  company: { max: 120 },
  message: { min: 20, max: 4000 },
};

/** Client-side checks before the form is posted to Netlify Forms. Returns {field: message}. */
export function validateMessage(values) {
  const errors = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const company = values.company.trim();
  const message = values.message.trim();

  if (!name) errors.name = 'Please enter your name.';
  else if (name.length < LIMITS.name.min) errors.name = `Name must be at least ${LIMITS.name.min} characters.`;
  else if (name.length > LIMITS.name.max) errors.name = `Name must be at most ${LIMITS.name.max} characters.`;

  if (!email) errors.email = 'Please enter your email so Gladys can reply.';
  else if (email.length > LIMITS.email.max || !EMAIL_RE.test(email)) errors.email = 'Please enter a valid email address.';

  if (company.length > LIMITS.company.max) errors.company = `Company must be at most ${LIMITS.company.max} characters.`;

  if (!message) errors.message = 'Please write a message.';
  else if (message.length < LIMITS.message.min) errors.message = `Please add a little more detail (at least ${LIMITS.message.min} characters).`;
  else if (message.length > LIMITS.message.max) errors.message = `Message must be at most ${LIMITS.message.max} characters.`;

  return errors;
}

/** Netlify Forms expects a URL-encoded body that names the form. */
export function encodeForm(formName, values) {
  const body = new URLSearchParams({ 'form-name': formName });
  for (const [k, v] of Object.entries(values)) body.append(k, typeof v === 'string' ? v.trim() : String(v));
  return body.toString();
}
