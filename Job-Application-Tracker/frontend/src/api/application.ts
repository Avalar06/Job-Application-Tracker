import type { Application, ApplicationCreate, ApplicationUpdate } from '../types';
import apiClient from './client';

export const getApplications = async (): Promise<Application[]> => {
  const response = await apiClient.get<Application[]>('/applications');
  return response.data;
};

export const getApplication = async (id: number): Promise<Application> => {
  const response = await apiClient.get<Application>(`/applications/${id}`);
  return response.data;
};

export const createApplication = async (payload: ApplicationCreate): Promise<Application> => {
  const response = await apiClient.post<Application>('/applications', payload);
  return response.data;
};

export const updateApplication = async ({ id, payload }: { id: number; payload: ApplicationUpdate }): Promise<Application> => {
  const response = await apiClient.put<Application>(`/applications/${id}`, payload);
  return response.data;
};

export const deleteApplication = async (id: number): Promise<void> => {
  await apiClient.delete(`/applications/${id}`);
};
