import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { saveToken } from '../utils/authStorage';
import type { LoginRequest } from '../types';

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginRequest>({ email: '', password: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginRequest, string>>>({});

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      saveToken(data.access_token);
      navigate('/dashboard');
    },
    onError: () => {
      setErrors((current) => ({ ...current, password: 'Invalid email or password.' }));
    },
  });

  const validate = () => {
    const nextErrors: Partial<Record<keyof LoginRequest, string>> = {};

    if (!form.email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!form.password.trim()) {
      nextErrors.password = 'Password is required.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    mutation.mutate(form);
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Welcome back</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Login to your account</h1>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
            placeholder="you@example.com"
          />
          {errors.email ? <p className="mt-1 text-sm text-red-600">{errors.email}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
            placeholder="Enter your password"
          />
          {errors.password ? <p className="mt-1 text-sm text-red-600">{errors.password}</p> : null}
        </div>

        {mutation.isError ? <p className="text-sm text-red-600">{mutation.error.message}</p> : null}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {mutation.isPending ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="text-sm text-slate-600">
        New here?{' '}
        <a className="font-medium text-slate-900" href="/register">
          Create an account
        </a>
      </p>
    </div>
  );
};

export default LoginPage;
