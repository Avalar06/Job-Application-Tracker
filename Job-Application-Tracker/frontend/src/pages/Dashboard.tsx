import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { getApplications } from '../api/application';

const statusColors: Record<string, string> = {
  pending: '#64748b',
  applied: '#3b82f6',
  interview: '#f59e0b',
  offer: '#10b981',
  rejected: '#ef4444',
};

const DashboardPage = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['applications'],
    queryFn: getApplications,
  });

  const applications = useMemo(() => data ?? [], [data]);

  const summaryCards = useMemo(() => {
    const counts = applications.reduce(
      (accumulator, application) => {
        accumulator.total += 1;
        accumulator[application.status] = (accumulator[application.status] ?? 0) + 1;
        return accumulator;
      },
      { total: 0, pending: 0, applied: 0, interview: 0, offer: 0, rejected: 0 } as Record<string, number>,
    );

    return [
      { label: 'Total Applications', value: counts.total, tone: 'bg-slate-900 text-white' },
      { label: 'Applied', value: counts.applied, tone: 'bg-blue-50 text-blue-700' },
      { label: 'Interview', value: counts.interview, tone: 'bg-amber-50 text-amber-700' },
      { label: 'Offer', value: counts.offer, tone: 'bg-emerald-50 text-emerald-700' },
      { label: 'Rejected', value: counts.rejected, tone: 'bg-rose-50 text-rose-700' },
    ];
  }, [applications]);

  const statusDistribution = useMemo(() => {
    const counts = applications.reduce<Record<string, number>>((accumulator, application) => {
      const key = application.status || 'pending';
      accumulator[key] = (accumulator[key] ?? 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [applications]);

  const applicationsOverTime = useMemo(() => {
    const grouped = applications.reduce<Record<string, number>>((accumulator, application) => {
      if (!application.applied_date) {
        return accumulator;
      }

      const date = new Date(application.applied_date);
      const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      accumulator[key] = (accumulator[key] ?? 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(grouped)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([name, value]) => ({ name, value }));
  }, [applications]);

  const recentApplications = useMemo(() => {
    return [...applications]
      .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime())
      .slice(0, 5);
  }, [applications]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Overview</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">Monitor your job search progress at a glance.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/applications" className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            View Applications
          </Link>
          <Link to="/applications" className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
            Add Application
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-sm text-slate-600">Loading dashboard…</div>
      ) : null}

      {isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error instanceof Error ? error.message : 'Unable to load the dashboard.'}
        </div>
      ) : null}

      {!isLoading && !isError && applications.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-sm text-slate-600">
          No applications yet. Add your first one to start tracking your progress.
        </div>
      ) : null}

      {!isLoading && !isError && applications.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {summaryCards.map((card) => (
              <div key={card.label} className={`rounded-lg border border-slate-200 p-4 ${card.tone}`}>
                <p className="text-sm font-medium opacity-80">{card.label}</p>
                <p className="mt-2 text-3xl font-semibold">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Status Distribution</h2>
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusDistribution} dataKey="value" nameKey="name" outerRadius={90}>
                      {statusDistribution.map((entry) => (
                        <Cell key={entry.name} fill={statusColors[entry.name] ?? '#64748b'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Applications Over Time</h2>
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={applicationsOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0f172a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Recent Applications</h2>
                <Link to="/applications" className="text-sm font-medium text-slate-700">
                  View all
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {recentApplications.map((application) => (
                  <div key={application.id} className="flex items-center justify-between rounded border border-slate-200 p-3">
                    <div>
                      <p className="font-medium text-slate-900">{application.company_name}</p>
                      <p className="text-sm text-slate-600">{application.job_title}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-700">{application.status}</p>
                      <p className="text-xs text-slate-500">
                        {application.applied_date ? new Date(application.applied_date).toLocaleDateString() : '—'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
              <div className="mt-4 flex flex-col gap-3">
                <Link to="/applications" className="rounded border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700">
                  Add Application
                </Link>
                <Link to="/applications" className="rounded bg-slate-900 px-4 py-3 text-sm font-semibold text-white">
                  View Applications
                </Link>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default DashboardPage;
