/**
 * C1 User sign up page. One form with two labelled fields (Email, Password)
 * and two actions: "Log in" and "Create account".
 * Keyboard focus starts in the Email box, then goes to Password.
 *
 * SIMULATED authentication: accounts live in localStorage only.
 */
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { useAppData } from '@shared/data/appData';
import { DEMO_ACCOUNT } from '@shared/data/sample';
import { queueFlash, useFlash } from '@shared/lib/useFlash';
import { Button } from '@shared/ui/button';
import { TextField } from '@shared/ui/field';
import { StatusMessage } from '@shared/ui/status';

type Mode = 'login' | 'signup';
interface Errors {
  email?: string;
  password?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(email: string, password: string, mode: Mode): Errors {
  const e: Errors = {};
  if (!email.trim()) e.email = 'Enter your email address.';
  else if (!EMAIL_RE.test(email.trim())) e.email = 'Enter an email address like name@example.com.';
  if (!password) e.password = 'Enter your password.';
  else if (mode === 'signup' && (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)))
    e.password = 'Your password needs at least 8 characters, with at least one letter and one number.';
  return e;
}

export function AuthPage() {
  const { logIn, signUp } = useAppData();
  const navigate = useNavigate();
  const [flash, setFlash] = useFlash();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const submit = (mode: Mode) => (ev?: FormEvent) => {
    ev?.preventDefault();
    setFlash(null);
    const e = validate(email, password, mode);
    setErrors(e);
    if (e.email || e.password) {
      setFormError('Some information is missing or not valid. Check the fields marked with an error.');
      return;
    }
    const res = mode === 'login' ? logIn(email, password) : signUp(email, password);
    if (!res.ok) {
      setFormError(res.error);
      return;
    }
    setFormError(null);
    queueFlash({
      kind: 'success',
      text: mode === 'login' ? 'You are logged in.' : 'Your account was created. Answer 3 short questions to set up your dashboard.',
    });
    navigate(mode === 'login' ? '/' : '/questionnaire');
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col justify-center px-4 py-8">
      <h1 className="m-0 text-3xl font-bold">Welcome to Wellness Tracker</h1>
      <p className="mt-3 text-lg">Log in to your account, or create a new account to get started.</p>

      {flash && <StatusMessage kind={flash.kind} className="mb-4">{flash.text}</StatusMessage>}
      {formError && <StatusMessage kind="error" className="mb-4">{formError}</StatusMessage>}

      <form noValidate onSubmit={submit('login')} className="flex flex-col gap-5">
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          hint="At least 8 characters, with a letter and a number."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <div className="mt-2 flex flex-col gap-3">
          <Button type="submit" size="block">
            Log in
          </Button>
          <Button variant="outline" size="block" onClick={() => submit('signup')()}>
            Create account
          </Button>
        </div>
      </form>

      <aside className="mt-8 rounded-xl bg-raised p-4" aria-label="Prototype information">
        <p className="m-0 font-bold">Prototype: simulated accounts</p>
        <p className="m-0 mt-1">
          Demo account: {DEMO_ACCOUNT.email} / {DEMO_ACCOUNT.password}. Accounts are only stored in this browser.
        </p>
      </aside>
    </main>
  );
}
