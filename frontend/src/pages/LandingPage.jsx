import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-white font-sans selection:bg-blue-500 selection:text-white overflow-hidden transition-colors duration-300">
      
      {/* --- AMBIENT BACKGROUND GLOWS --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 dark:bg-blue-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 dark:bg-purple-600/10 blur-[120px] pointer-events-none"></div>

      {/* --- NAVIGATION --- */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[#0f172a] dark:bg-white flex items-center justify-center shrink-0 shadow-md">
            <span className="text-white dark:text-[#0f172a] font-black text-xl">B</span>
          </div>
          <span className="text-2xl font-black tracking-tight">BEIS</span>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link to="/" className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-bold text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                Sign In
              </Link>
              <Link to="/login" className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md">
                Client Portal
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4 pt-20 pb-32 text-center max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-8 border border-blue-100 dark:border-blue-800/50 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Next-Generation Facility Management
        </div>
        
        <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.1] mb-6">
          Intelligent operations for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">modern properties.</span>
        </h1>
        
        <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-2xl font-medium leading-relaxed">
          BE Integrated Services brings your job sites, field technicians, and client requests into one powerful, real-time command center.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link to="/login" className="w-full sm:w-auto text-base font-bold text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:opacity-90 px-8 py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
            Access System <span aria-hidden="true">&rarr;</span>
          </Link>
          <a href="#features" className="w-full sm:w-auto text-base font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 px-8 py-4 rounded-2xl transition-all shadow-sm flex items-center justify-center">
            Explore Features
          </a>
        </div>
      </main>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">Everything you need to scale operations.</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Built for facility managers, field technicians, and enterprise clients.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow group">
            <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Live Kanban Boards</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed font-medium">
              Visually track work orders from request to completion. Drag and drop to update statuses instantly across the network.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow group">
            <div className="h-14 w-14 rounded-2xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Automated Timesheets</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed font-medium">
              Eliminate manual entry. The system automatically calculates technician hours based on precise work order start and end times.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow group">
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Client Portals</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed font-medium">
              Give your clients full transparency. Dedicated roles allow clients to log requests and monitor their property portfolios securely.
            </p>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="relative z-10 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-black text-lg">BEIS</span>
            <span className="text-sm font-medium text-gray-500">&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-bold text-gray-500">
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>

    </div>
  );
}