import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getApplications } from '../api/application';
import { getCurrentUser } from '../api/auth';
import { getToken } from '../utils/authStorage';

const ProfilePage = () => {
  const token = getToken();

  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
  } = useQuery({
    queryKey: ['current-user'],
    queryFn: getCurrentUser,
    retry: false,
  });

  const {
    data: applications = [],
    isLoading: isApplicationsLoading,
    isError: isApplicationsError,
    error: applicationsError,
  } = useQuery({
    queryKey: ['applications'],
    queryFn: getApplications,
  });

  const stats = useMemo(() => {
    const counts = applications.reduce(
      (accumulator, application) => {
        accumulator.total += 1;
        accumulator[application.status] = (accumulator[application.status] ?? 0) + 1;
        return accumulator;
      },
      { total: 0, applied: 0, interview: 0, offer: 0, accepted: 0, rejected: 0 } as Record<string, number>,
    );

    return [
      { label: 'Total Applications', value: counts.total, tone: 'bg-slate-900 text-white' },
      { label: 'Applied', value: counts.applied ?? 0, tone: 'bg-blue-50 text-blue-700' },
      { label: 'Interview', value: counts.interview ?? 0, tone: 'bg-amber-50 text-amber-700' },
      { label: 'Offer', value: counts.offer ?? 0, tone: 'bg-emerald-50 text-emerald-700' },
      { label: 'Accepted', value: counts.accepted ?? 0, tone: 'bg-violet-50 text-violet-700' },
      { label: 'Rejected', value: counts.rejected ?? 0, tone: 'bg-rose-50 text-rose-700' },
    ];
  }, [applications]);

  const displayName = user?.full_name?.trim() || 'Authenticated User';
  const initial = displayName.charAt(0).toUpperCase() || 'U';
  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—';

  const isLoggedIn = Boolean(token && user);
  const hasJwt = Boolean(token);
  const backendConnected = !isUserError && !isUserLoading;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Personal Profile</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">Profile</h1>
          <p className="mt-1 text-sm text-slate-600">Review your account information and overall application progress.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/dashboard" className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            Go to Dashboard
          </Link>
          <Link to="/applications" className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
            View Applications
          </Link>
        </div>
      </div>

      {(isUserLoading || isApplicationsLoading) && (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-sm text-slate-600">Loading your profile…</div>
      )}

      {isUserError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {userError instanceof Error ? userError.message : 'Unable to load your profile information.'}
        </div>
      ) : null}

      {isApplicationsError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {applicationsError instanceof Error ? applicationsError.message : 'Unable to load your application statistics.'}
        </div>
      ) : null}

      {!isUserLoading && !isApplicationsLoading && (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-2xl font-semibold text-white">
                {initial}
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Account Overview</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">{displayName}</h2>
                <p className="mt-1 text-sm text-slate-600">{user?.email ?? 'No email available'}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">Full Name</p>
                <p className="mt-1 text-sm text-slate-900">{user?.full_name ?? '—'}</p>
              </div>
              <div className="rounded border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">Email</p>
                <p className="mt-1 text-sm text-slate-900">{user?.email ?? '—'}</p>
              </div>
              <div className="rounded border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                <p className="text-sm font-semibold text-slate-500">Account Created</p>
                <p className="mt-1 text-sm text-slate-900">{createdAt}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Statistics</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {stats.map((card) => (
                <div key={card.label} className={`rounded-lg border border-slate-200 p-4 ${card.tone}`}>
                  <p className="text-sm font-medium opacity-80">{card.label}</p>
                  <p className="mt-2 text-2xl font-semibold">{card.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!isUserLoading && !isApplicationsLoading && (
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
            <div className="mt-4 flex flex-col gap-3">
              <Link to="/dashboard" className="rounded border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700">
                Go to Dashboard
              </Link>
              <Link to="/applications" className="rounded border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700">
                View Applications
              </Link>
              <Link to="/applications" className="rounded bg-slate-900 px-4 py-3 text-sm font-semibold text-white">
                Add Application
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Account</h2>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between rounded border border-slate-200 p-3">
                <span className="text-sm text-slate-600">Logged in</span>
                <span className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  {isLoggedIn ? 'Active' : 'Pending'}
                </span>
              </div>
              <div className="flex items-center justify-between rounded border border-slate-200 p-3">
                <span className="text-sm text-slate-600">JWT stored</span>
                <span className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  {hasJwt ? 'Available' : 'Missing'}
                </span>
              </div>
              <div className="flex items-center justify-between rounded border border-slate-200 p-3">
                <span className="text-sm text-slate-600">Backend connected</span>
                <span className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  {backendConnected ? 'Connected' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
