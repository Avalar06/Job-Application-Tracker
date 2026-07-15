import axios from 'axios';
import type { LoginRequest, LoginResponse, RegisterRequest, User } from '../types';
import apiClient from './client';

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;

    if (typeof detail === 'string') {
      return detail;
    }

    if (Array.isArray(detail)) {
      return detail.map((item) => (typeof item === 'string' ? item : item.msg)).join(' ');
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

export const register = async (payload: RegisterRequest): Promise<User> => {
  try {
    const response = await apiClient.post<User>('/auth/register', payload);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Registration failed. Please try again.'));
  }
};

export const login = async (payload: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<LoginResponse>('/auth/login', payload);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Login failed. Please check your credentials.'));
  }
};

export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Unable to load the current user.'));
  }
};
