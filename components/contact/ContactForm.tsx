'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { cn } from '@/lib/cn';
import { Arrow } from '@/components/ui/icons/Arrow';
import { TurnstileWidget } from './TurnstileWidget';

const FormSchema = z.object({
  name: z.string().trim().min(1, 'Required').max(120),
  email: z.string().trim().email('Enter a valid email').max(200),
  projectType: z.string().trim().min(1, 'Pick one'),
  budget: z.string().trim().max(80).optional().default(''),
  message: z.string().trim().min(10, 'Tell us a little more').max(4000),
  website: z.string().max(0).optional().default(''), // honeypot
});

type Values = z.infer<typeof FormSchema>;

const PROJECT_TYPES = [
  'Models and Sculptures',
  'Interpretation Centers',
  'Exhibits and Dioramas',
  'Informative Panels and Signages',
  'Books and Publicity Materials',
  'Film Making',
  'Web Applications & Interactive Software',
  'Kiosks',
  'AR & VR Applications',
  'Multi-discipline / not sure',
];

const BUDGETS = ['Under ₹10 L', '₹10–50 L', '₹50 L – 1 Cr', '1–5 Cr', '5 Cr+', 'Discussing'];

type Status = 'idle' | 'submitting' | 'success' | 'error' | 'rate_limited';

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [serverError, setServerError] = useState<string>('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    mode: 'onTouched',
    defaultValues: {
      name: '',
      email: '',
      projectType: '',
      budget: '',
      message: '',
      website: '',
    },
  });

  // Stable callback identity so the Turnstile widget doesn't re-render.
  const onTurnstileToken = useCallback((token: string | null) => {
    setTurnstileToken(token);
  }, []);

  // Whether bot protection is configured for this environment. When the
  // public site key isn't set, the widget shows a dev notice and we let
  // submissions through without a token (the server enforces in prod).
  const captchaConfigured = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
  const captchaReady = captchaConfigured ? Boolean(turnstileToken) : true;

  async function onSubmit(values: Values) {
    setStatus('submitting');
    setServerError('');

    const parsed = FormSchema.safeParse(values);
    if (!parsed.success) {
      setStatus('error');
      return;
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...parsed.data, turnstileToken }),
      });

      if (res.status === 429) {
        setStatus('rate_limited');
        return;
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setServerError(data.error ?? 'send_failed');
        setStatus('error');
        return;
      }

      setStatus('success');
      reset();
      setTurnstileToken(null);
    } catch {
      setServerError('network');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="border border-brand-gold/40 bg-brand-gold/5 p-10"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-brand-gold text-brand-gold">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path
              d="M4 10l4 4 8-9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3 className="mt-6 font-display text-3xl font-medium text-brand-gold">
          Message received.
        </h3>
        <p className="mt-3 text-brand-muted">We'll be in touch within 48 hours.</p>
      </div>
    );
  }

  if (status === 'rate_limited') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="border border-yellow-500/40 bg-yellow-500/5 p-10"
      >
        <h3 className="font-display text-2xl font-medium text-brand-text">
          Too many submissions.
        </h3>
        <p className="mt-3 text-brand-muted">
          For everyone's sake we limit how often the form can be sent from one network.
          Please try again in an hour, or email{' '}
          <a className="text-brand-gold underline" href="mailto:cavinish@gmail.com">
            cavinish@gmail.com
          </a>{' '}
          directly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
      <div aria-live="polite" className="sr-only">
        {status === 'submitting' && 'Sending message…'}
        {status === 'error' && 'Something went wrong. Please try again.'}
      </div>

      {/* Honeypot — hidden from real users */}
      <div aria-hidden className="hidden" tabIndex={-1}>
        <label>
          Website (leave blank)
          <input type="text" autoComplete="off" tabIndex={-1} {...register('website')} />
        </label>
      </div>

      <Field label="Name" id="name" error={errors.name?.message}>
        <input
          id="name"
          type="text"
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
          {...register('name')}
          className={inputClass}
        />
      </Field>

      <Field label="Email" id="email" error={errors.email?.message}>
        <input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          {...register('email')}
          className={inputClass}
        />
      </Field>

      <Field label="Project type" id="projectType" error={errors.projectType?.message}>
        <select
          id="projectType"
          aria-invalid={Boolean(errors.projectType)}
          {...register('projectType')}
          className={cn(inputClass, 'appearance-none bg-[length:14px_14px] bg-no-repeat pr-10')}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 14 14' fill='none' stroke='%23E8B11E' stroke-width='1.5'><path d='M3 5l4 4 4-4'/></svg>\")",
            backgroundPosition: 'right 16px center',
          }}
        >
          <option value="">Choose one…</option>
          {PROJECT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Budget range" id="budget" error={errors.budget?.message} optional>
        <select
          id="budget"
          {...register('budget')}
          className={cn(inputClass, 'appearance-none bg-[length:14px_14px] bg-no-repeat pr-10')}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 14 14' fill='none' stroke='%23E8B11E' stroke-width='1.5'><path d='M3 5l4 4 4-4'/></svg>\")",
            backgroundPosition: 'right 16px center',
          }}
        >
          <option value="">—</option>
          {BUDGETS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Message" id="message" error={errors.message?.message}>
        <textarea
          id="message"
          rows={6}
          aria-invalid={Boolean(errors.message)}
          {...register('message')}
          className={cn(inputClass, 'resize-y')}
        />
      </Field>

      {/* Bot challenge — Cloudflare Turnstile (mostly invisible). */}
      <div>
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand-muted">
          Verification
        </span>
        <div className="mt-3">
          <TurnstileWidget onToken={onTurnstileToken} />
        </div>
      </div>

      <button
        type="submit"
        disabled={status === 'submitting' || !captchaReady}
        aria-disabled={status === 'submitting' || !captchaReady}
        className="group inline-flex items-center gap-3 rounded-full border border-brand-gold bg-brand-gold/10 px-8 py-3 font-mono text-xs uppercase tracking-[0.25em] text-brand-gold transition-colors hover:bg-brand-gold/20 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-gold"
        title={
          !captchaReady && captchaConfigured
            ? 'Waiting for bot-check verification…'
            : undefined
        }
      >
        {status === 'submitting'
          ? 'Sending…'
          : !captchaReady && captchaConfigured
            ? 'Verifying…'
            : 'Send Message'}
        <Arrow className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5" />
      </button>

      {status === 'error' && (
        <p role="alert" className="text-sm text-red-400">
          {serverError === 'captcha_failed'
            ? 'Bot-check verification failed. Reload the page and try again.'
            : "Something went wrong. Try again, or email cavinish@gmail.com directly."}
        </p>
      )}
    </form>
  );
}

const inputClass =
  'block w-full border-0 border-b border-brand-rule bg-transparent px-0 py-3 text-base text-brand-text outline-none transition-colors placeholder:text-brand-muted/40 focus:border-brand-gold focus-visible:outline-none aria-[invalid=true]:border-red-400';

function Field({
  label,
  id,
  error,
  optional,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-brand-muted"
      >
        <span>{label}</span>
        {optional && <span className="opacity-60">Optional</span>}
      </label>
      <div className="mt-2">{children}</div>
      {error && (
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
