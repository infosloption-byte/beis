import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  // Safely parse the user from local storage, or default to null if not found
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),

  // Call this when login is successful
  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user)); // <-- Save user to storage
    set({ user, token, isAuthenticated: true });
  },

  // Call this to log out
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // <-- Clear user from storage
    set({ user: null, token: null, isAuthenticated: false });
  }
}));