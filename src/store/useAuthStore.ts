import { create } from 'zustand';
import type { User, Organization, AuthResponse } from '../../shared/types';
import { authAPI } from '../lib/api';

interface AuthState {
  user: User | null;
  organization: Organization | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setOrganization: (org: Organization) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  organization: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login({ username, password });
      if (response.success && response.data) {
        const { token, user, organization } = response.data as AuthResponse;
        localStorage.setItem('token', token);
        set({
          user,
          organization,
          token,
          isAuthenticated: true,
          isLoading: false
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '登录失败',
        isLoading: false
      });
      throw error;
    }
  },

  register: async (username: string, email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.register({ username, email, password });
      if (response.success && response.data) {
        const { token, user, organization } = response.data as AuthResponse;
        localStorage.setItem('token', token);
        set({
          user,
          organization,
          token,
          isAuthenticated: true,
          isLoading: false
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '注册失败',
        isLoading: false
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({
      user: null,
      organization: null,
      token: null,
      isAuthenticated: false
    });
  },

  setOrganization: (org: Organization) => {
    set({ organization: org });
  },

  clearError: () => {
    set({ error: null });
  }
}));
