import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../lib/axios';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Initialize CSRF protection
      await axios.get('/sanctum/csrf-cookie');

      // 2. Send the login request
      const response = await axios.post('/api/login', {
        email,
        password,
      });

      // 3. Save the token and user data to our Zustand store
      const { access_token, user } = response.data;
      setAuth(user, access_token);

      // 4. Send axios the token for all future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      // 5. Redirect to the dashboard
      navigate('/');
      
    } catch (err) {
      if (err.response?.status === 422 || err.response?.status === 401) {
        setError('Invalid email or password.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 dark:bg-gray-950 overflow-hidden px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      
      {/* --- AMBIENT BACKGROUND GLOWS --- */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-purple-400/20 dark:bg-purple-600/10 blur-3xl pointer-events-none"></div>

      {/* --- LOGIN CARD --- */}
      <div className="relative w-full max-w-[440px] rounded-[2rem] bg-white dark:bg-gray-900 p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-gray-800/60 z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Branding Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-[0.5rem] bg-[#0f172a] dark:bg-white flex items-center justify-center shrink-0 shadow-md">
              <span className="text-white dark:text-[#0f172a] font-black text-2xl">B</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white leading-none">
              BEIS
            </h1>
          </div>
          <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">
            BE Integrated Services
          </span>
        </div>
        
        {/* Error Message Display */}
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 dark:bg-red-900/20 p-4 text-sm font-bold text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleLogin}>
          
          <div className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email-address" className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  className="block w-full rounded-xl border border-gray-200 dark:border-gray-800 pl-11 pr-4 py-3.5 text-sm bg-gray-50/50 dark:bg-gray-800/50 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                  placeholder="admin@beis.com"
                  value={email}
                  autoComplete="username"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-[11px] font-black text-gray-400 uppercase tracking-wider">
                  Password
                </label>
                <a href="#" className="text-[11px] font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 transition-colors">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full rounded-xl border border-gray-200 dark:border-gray-800 pl-11 pr-4 py-3.5 text-sm bg-gray-50/50 dark:bg-gray-800/50 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                  placeholder="••••••••"
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 hover:shadow-md disabled:opacity-50 disabled:hover:shadow-sm disabled:hover:bg-blue-600 transition-all"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Authenticating...
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </div>
          
        </form>
      </div>
      
      {/* Footer text */}
      <div className="absolute bottom-6 text-center w-full text-[11px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-wider">
        &copy; {new Date().getFullYear()} BE Integrated Services. All rights reserved.
      </div>
      
    </div>
  );
}