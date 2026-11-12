/**
 * C1 Sign up / log in.
 * One form, two modes (segmented control). Focus starts in Email.
 * Validation on submit with per-field errors + a summary (AR9, AR10).
 * Errors handled: invalid email, weak password, wrong credentials, email
 * already used. "Try a demo profile" logs in one of three sample users.
 * SIMULATED authentication (localStorage).
 */
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { DEMO_ACCOUNTS, EXPERIENCE_INFO, useStore } from '@core';
import { BrandMark, Button, InlineStatus, Segmented, TextField, useToast } from '@ds';

type Mode = 'login' | 'signup';
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function AuthScreen() {
  const { logIn, signUp, iteration } = useStore();
  const demos = DEMO_ACCOUNTS.filter((d) => iteration.experiences.includes(d.experience));
  const toast = useToast();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const er: typeof errors = {};
    if (!email.trim()) er.email = 'Enter your email address.';
    else if (!EMAIL.test(email.trim())) er.email = 'Enter an email like name@example.com.';
    if (!password) er.password = 'Enter your password.';
    else if (mode === 'signup' && (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password))) er.password = 'Use at least 8 characters, with a letter and a number.';
    setErrors(er);
    if (er.email || er.password) {
      setFormError('Check the fields marked with an error.');
      return;
    }
    const res = mode === 'login' ? logIn(email, password) : signUp(email, password);
    if (!res.ok) {
      setFormError(res.error);
      return;
    }
    toast('success', mode === 'login' ? 'You are logged in.' : 'Account created. A few questions to set up your app.');
    navigate(mode === 'login' ? '/' : '/onboarding');
  };

  const demo = (email: string, name: string) => {
    logIn(email, 'Demo1234');
    toast('success', `Logged in as ${name} (demo profile).`);
    navigate('/');
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col px-5 pb-10 pt-[max(40px,env(safe-area-inset-top))]">
      <div className="anim-rise">
        <div className="flex items-center justify-between">
          <BrandMark size={64} />
          <span className="rounded-full bg-surface px-3 py-1 font-bold">{iteration.name}</span>
        </div>
        <h1 className="m-0 mt-6 text-4xl font-bold tracking-tight">Wellness Tracker</h1>
        <p className="m-0 mt-3 text-lg text-ink-soft">Training, food and sleep in one calm place, shaped around how you live.</p>
      </div>

      <form noValidate onSubmit={submit} className="mt-8 flex flex-col gap-5">
        <Segmented
          label="Log in or create an account"
          value={mode}
          onChange={(m) => {
            setMode(m);
            setErrors({});
            setFormError(null);
          }}
          options={[
            { value: 'login', label: 'Log in' },
            { value: 'signup', label: 'Create account' },
          ]}
        />
        {formError && <InlineStatus kind="error">{formError}</InlineStatus>}
        <TextField label="Email" type="email" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        <TextField
          label="Password"
          type="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          hint={mode === 'signup' ? 'At least 8 characters, with a letter and a number.' : undefined}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <Button type="submit" size="lg" block>
          {mode === 'login' ? 'Log in' : 'Create account'}
        </Button>
      </form>

      <section aria-labelledby="demo-title" className="mt-10">
        <h2 id="demo-title" className="m-0 text-lg font-bold">
          Try a demo profile
        </h2>
        <p className="m-0 mt-1 text-ink-soft">Each one shows a different experience. Sample data, simulated login.</p>
        <ul className="m-0 mt-4 grid list-none gap-3 p-0">
          {demos.map((d) => (
            <li key={d.email}>
              <button type="button" onClick={() => demo(d.email, d.name)} className="card flex min-h-16 w-full cursor-pointer items-center gap-4 px-4 py-3 text-left text-ink transition-colors hover:bg-surface-hi">
                <span className="min-w-0 flex-1">
                  <span className="block font-bold">
                    {d.name} · {EXPERIENCE_INFO[d.experience].name}
                  </span>
                  <span className="block text-ink-soft">{EXPERIENCE_INFO[d.experience].tagline}</span>
                </span>
                <span aria-hidden="true" className="text-xl">
                  →
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="m-0 mt-4 text-ink-soft">Or log in with {demos[0].email} / Demo1234.</p>
      </section>

      <p className="m-0 mt-10 text-ink-soft">Sample prototype for learning and educational purposes only. Not for commercial use or commercial testing.</p>
    </main>
  );
}
