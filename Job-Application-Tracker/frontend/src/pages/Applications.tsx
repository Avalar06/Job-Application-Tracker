import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { createApplication, deleteApplication, getApplications, updateApplication } from '../api/application';
import type { Application, ApplicationCreate, ApplicationUpdate } from '../types';

type ApplicationFormValues = {
  company_name: string;
  job_title: string;
  status: string;
  location: string;
  job_url: string;
  salary: string;
  applied_date: string;
  notes: string;
};

const emptyFormValues = (): ApplicationFormValues => ({
  company_name: '',
  job_title: '',
  status: 'pending',
  location: '',
  job_url: '',
  salary: '',
  applied_date: '',
  notes: '',
});

const ApplicationsPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<'applied_date' | 'company_name' | 'job_title' | 'status'>('applied_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['applications'],
    queryFn: getApplications,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ApplicationFormValues>({
    defaultValues: emptyFormValues(),
  });

  const createMutation = useMutation({
    mutationFn: createApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setIsModalOpen(false);
      reset(emptyFormValues());
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setIsModalOpen(false);
      setEditingApplication(null);
      reset(emptyFormValues());
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });

  const applications = useMemo(() => data ?? [], [data]);

  const filteredAndSortedApplications = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filtered = applications.filter((application) => {
      const matchesStatus = statusFilter === 'all' || application.status === statusFilter;
      const haystacks = [application.company_name, application.job_title, application.location ?? '']
        .join(' ')
        .toLowerCase();
      const matchesSearch = normalizedQuery.length === 0 || haystacks.includes(normalizedQuery);

      return matchesStatus && matchesSearch;
    });

    const sorted = [...filtered].sort((left, right) => {
      const leftValue = left[sortField] ?? '';
      const rightValue = right[sortField] ?? '';

      const compareValue = String(leftValue).localeCompare(String(rightValue), undefined, { sensitivity: 'base' });
      return sortDirection === 'asc' ? compareValue : -compareValue;
    });

    return sorted;
  }, [applications, searchQuery, statusFilter, sortDirection, sortField]);

  const openCreateModal = () => {
    setEditingApplication(null);
    reset(emptyFormValues());
    setIsModalOpen(true);
  };

  const openEditModal = (application: Application) => {
    setEditingApplication(application);
    reset({
      company_name: application.company_name,
      job_title: application.job_title,
      status: application.status,
      location: application.location ?? '',
      job_url: application.job_url ?? '',
      salary: application.salary ?? '',
      applied_date: application.applied_date ?? '',
      notes: application.notes ?? '',
    });
    setIsModalOpen(true);
  };

  const onSubmit = (values: ApplicationFormValues) => {
    const payload: ApplicationCreate | ApplicationUpdate = {
      company_name: values.company_name,
      job_title: values.job_title,
      status: values.status,
      location: values.location || null,
      job_url: values.job_url || null,
      salary: values.salary || null,
      applied_date: values.applied_date || null,
      notes: values.notes || null,
    };

    if (editingApplication) {
      updateMutation.mutate({ id: editingApplication.id, payload });
      return;
    }

    createMutation.mutate(payload as ApplicationCreate);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Applications</h1>
          <p className="text-sm text-slate-600">Track your job search pipeline in one place.</p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Add Application
        </button>
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-sm text-slate-600">Loading applications…</div>
      ) : null}

      {isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error instanceof Error ? error.message : 'Unable to load applications.'}
        </div>
      ) : null}

      {!isLoading && !isError && applications.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-sm text-slate-600">
          No applications yet. Add your first one to get started.
        </div>
      ) : null}

      {!isLoading && !isError && applications.length > 0 ? (
        <>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="search">
                  Search
                </label>
                <input
                  id="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search by company, title, or location"
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                />
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="status-filter">
                    Status
                  </label>
                  <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 sm:min-w-40"
                  >
                    <option value="all">All</option>
                    <option value="applied">Applied</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                    <option value="accepted">Accepted</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="sort-field">
                    Sort By
                  </label>
                  <select
                    id="sort-field"
                    value={sortField}
                    onChange={(event) => setSortField(event.target.value as 'applied_date' | 'company_name' | 'job_title' | 'status')}
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 sm:min-w-36"
                  >
                    <option value="applied_date">Applied Date</option>
                    <option value="company_name">Company Name</option>
                    <option value="job_title">Job Title</option>
                    <option value="status">Status</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="sort-direction">
                    Direction
                  </label>
                  <select
                    id="sort-direction"
                    value={sortDirection}
                    onChange={(event) => setSortDirection(event.target.value as 'asc' | 'desc')}
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 sm:min-w-36"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setSortField('applied_date');
                    setSortDirection('desc');
                  }}
                  className="rounded border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
              <p>Showing {filteredAndSortedApplications.length} Application{filteredAndSortedApplications.length === 1 ? '' : 's'}</p>
            </div>
          </div>

          {filteredAndSortedApplications.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-sm text-slate-600">
              No applications match your filters.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Company</th>
                <th className="px-4 py-3 font-semibold">Job Title</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Applied Date</th>
                <th className="px-4 py-3 font-semibold">Location</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedApplications.map((application) => (
                <tr key={application.id} className="border-t border-slate-200">
                  <td className="px-4 py-3">{application.company_name}</td>
                  <td className="px-4 py-3">{application.job_title}</td>
                  <td className="px-4 py-3">{application.status}</td>
                  <td className="px-4 py-3">{application.applied_date ? new Date(application.applied_date).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3">{application.location ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(application)}
                        className="rounded border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteMutation.mutate(application.id)}
                        className="rounded border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          )}
        </>
      ) : null}

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-8">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {editingApplication ? 'Edit Application' : 'Add Application'}
                </h2>
                <p className="text-sm text-slate-600">
                  {editingApplication ? 'Update the selected application.' : 'Create a new application entry.'}
                </p>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-sm font-medium text-slate-600">
                Close
              </button>
            </div>

            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="company_name">
                  Company Name
                </label>
                <input
                  id="company_name"
                  {...register('company_name', { required: 'Company name is required.' })}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                />
                {errors.company_name ? <p className="mt-1 text-sm text-red-600">{errors.company_name.message}</p> : null}
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="job_title">
                  Job Title
                </label>
                <input
                  id="job_title"
                  {...register('job_title', { required: 'Job title is required.' })}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                />
                {errors.job_title ? <p className="mt-1 text-sm text-red-600">{errors.job_title.message}</p> : null}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="status">
                  Status
                </label>
                <select
                  id="status"
                  {...register('status', { required: 'Status is required.' })}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                >
                  <option value="pending">Pending</option>
                  <option value="applied">Applied</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                </select>
                {errors.status ? <p className="mt-1 text-sm text-red-600">{errors.status.message}</p> : null}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="location">
                  Location
                </label>
                <input id="location" {...register('location')} className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900" />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="job_url">
                  Job URL
                </label>
                <input id="job_url" {...register('job_url')} className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900" />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="salary">
                  Salary
                </label>
                <input id="salary" {...register('salary')} className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900" />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="applied_date">
                  Applied Date
                </label>
                <input id="applied_date" type="date" {...register('applied_date')} className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900" />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="notes">
                  Notes
                </label>
                <textarea id="notes" {...register('notes')} className="min-h-24 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900" />
              </div>

              <div className="md:col-span-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">
                  Cancel
                </button>
                <button type="submit" className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                  {editingApplication ? 'Save Changes' : 'Create Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ApplicationsPage;
