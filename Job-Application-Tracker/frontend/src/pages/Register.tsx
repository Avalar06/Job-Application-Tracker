import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { register } from '../api/auth';
import type { RegisterRequest } from '../types';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterRequest>({ full_name: '', email: '', password: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterRequest, string>>>({});

  const mutation = useMutation({
    mutationFn: register,
    onSuccess: () => {
      navigate('/login');
    },
  });

  const validate = () => {
    const nextErrors: Partial<Record<keyof RegisterRequest, string>> = {};

    if (!form.full_name.trim()) {
      nextErrors.full_name = 'Full name is required.';
    }

    if (!form.email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!form.password.trim()) {
      nextErrors.password = 'Password is required.';
    } else if (form.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.';
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
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Create your account</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Register</h1>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="full_name">
            Full name
          </label>
          <input
            id="full_name"
            type="text"
            value={form.full_name}
            onChange={(event) => setForm({ ...form, full_name: event.target.value })}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
            placeholder="Jane Doe"
          />
          {errors.full_name ? <p className="mt-1 text-sm text-red-600">{errors.full_name}</p> : null}
        </div>

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
            placeholder="Create a password"
          />
          {errors.password ? <p className="mt-1 text-sm text-red-600">{errors.password}</p> : null}
        </div>

        {mutation.isError ? <p className="text-sm text-red-600">{mutation.error.message}</p> : null}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {mutation.isPending ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="text-sm text-slate-600">
        Already have an account?{' '}
        <a className="font-medium text-slate-900" href="/login">
          Sign in
        </a>
      </p>
    </div>
  );
};

export default RegisterPage;
