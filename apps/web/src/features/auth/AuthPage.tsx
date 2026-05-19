import { useState } from 'react';
import type { ComponentProps } from 'react';

import {
  useLoginMutation,
  useRegisterMutation,
} from './hooks/useAuthQueries';

type AuthMode = 'login' | 'register';

type AuthPageProps = {
  mode: AuthMode;
  onNavigate: (path: string) => void;
};

type FormSubmitHandler = NonNullable<ComponentProps<'form'>['onSubmit']>;

export function AuthPage({ mode, onNavigate }: AuthPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const activeMutation = mode === 'login' ? loginMutation : registerMutation;
  const isPending = activeMutation.isPending;
  const canSubmit =
    email.trim().length > 0 && password.length >= 8 && !isPending;

  const handleSubmit: FormSubmitHandler = (event) => {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    activeMutation.mutate(
      {
        email: email.trim(),
        password,
      },
      {
        onSuccess: () => onNavigate('/'),
      },
    );
  };

  const title = mode === 'login' ? 'Login' : 'Register';
  const buttonLabel =
    mode === 'login'
      ? isPending
        ? 'Logging in...'
        : 'Login'
      : isPending
        ? 'Creating account...'
        : 'Create account';
  const switchPath = mode === 'login' ? '/register' : '/login';
  const switchLabel =
    mode === 'login' ? 'Create an account' : 'Already have an account';

  return (
    <main className="mx-auto min-h-screen w-[min(520px,calc(100vw-32px))] py-10 text-slate-800 max-[860px]:w-[min(calc(100%_-_20px),520px)] max-[860px]:py-6">
      <header className="mb-6">
        <button
          className="mb-5 min-h-9 rounded-lg border border-slate-300 px-3 text-[13px] font-bold text-slate-700"
          type="button"
          onClick={() => onNavigate('/')}
        >
          Back to assistant
        </button>
        <h1 className="m-0 text-[32px] leading-tight font-bold text-slate-950">
          {title}
        </h1>
      </header>

      <form
        className="rounded-lg border border-slate-300 bg-white p-5 shadow-[0_16px_38px_rgb(15_23_42/0.07)]"
        onSubmit={handleSubmit}
      >
        <label className="mb-4 grid gap-2">
          <span className="text-[13px] font-bold text-slate-700">Email</span>
          <input
            className="h-[42px] w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-950 outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />
        </label>

        <label className="mb-4 grid gap-2">
          <span className="text-[13px] font-bold text-slate-700">Password</span>
          <input
            className="h-[42px] w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-950 outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={
              mode === 'login' ? 'current-password' : 'new-password'
            }
          />
        </label>

        <button
          className="min-h-11 w-full cursor-pointer rounded-lg bg-blue-700 font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          type="submit"
          disabled={!canSubmit}
        >
          {buttonLabel}
        </button>

        {password.length > 0 && password.length < 8 && (
          <p className="mt-3 text-[13px] text-amber-800">
            Password must be at least 8 characters.
          </p>
        )}

        {activeMutation.isError && (
          <p className="mt-3 text-[13px] font-semibold text-red-800">
            {activeMutation.error instanceof Error
              ? activeMutation.error.message
              : 'Authentication request failed.'}
          </p>
        )}

        <button
          className="mt-4 min-h-9 rounded-lg border border-slate-300 px-3 text-[13px] font-bold text-slate-700"
          type="button"
          onClick={() => onNavigate(switchPath)}
        >
          {switchLabel}
        </button>
      </form>
    </main>
  );
}
