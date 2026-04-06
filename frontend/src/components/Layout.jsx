import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import axios from '../lib/axios';

export default function Layout() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') return window.innerWidth >= 1024;
    return true;
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0); 

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await axios.post('/api/logout');
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      clearAuth();
      navigate('/login');
    }
  };

  const isAdmin = user?.roles?.some(role => role === 'Admin' || role?.name === 'Admin');

  // --- UPDATED NAVIGATION ITEMS ---
  const navItems = [
    { name: 'Dashboard', path: '/', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Job Sites', path: '/properties', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { name: 'Work Orders', path: '/jobs', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    ...(isAdmin ? [
      { name: 'Clients & Users', path: '/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
      { name: 'Reports & Analytics', path: '/reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }
    ] : []),
  ];

  // --- UPDATED HEADER CONTENT GENERATOR ---
  const getHeaderContent = () => {
    // Catch dynamic detail routes
    if (location.pathname.startsWith('/jobs/')) return { title: 'Work Order Details', sub: 'View and manage work order timeline.' };
    if (location.pathname.startsWith('/properties/')) return { title: 'Site Profile', sub: 'View comprehensive facility data and history.' };
    if (location.pathname.startsWith('/users/')) return { title: 'User Profile', sub: 'View detailed user and activity information.' };
    
    // Catch standard routes
    switch(location.pathname) {
      case '/': return { title: <><span className="font-normal">Welcome back, </span><span className="font-bold">{user?.name?.split(' ')[0]}!</span></>, sub: "Here is what's happening across your facilities today." };
      case '/properties': return { title: "Manage Job Sites", sub: "Manage all service locations and facility details." };
      case '/jobs': return { title: "Manage Work Orders", sub: "Track and manage all maintenance requests." };
      case '/users': return { title: "Manage Clients & Users", sub: "Manage clients & system access and field staff." };
      case '/reports': return { title: "Reports & Analytics", sub: "Analyze platform usage, resource allocation, and operational metrics." };
      default: return { title: navItems.find(item => item.path === location.pathname)?.name || 'BEIS', sub: '' };
    }
  };

  const headerInfo = getHeaderContent();

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-gray-950 transition-colors duration-200 overflow-hidden font-sans">
      
      {isSidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm lg:hidden transition-opacity" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar Area */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 flex flex-col bg-white dark:bg-gray-900 transition-all duration-300 ease-in-out lg:static lg:h-screen shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-none ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:-ml-64'
        }`}
      >
        <div className="flex flex-col shrink-0 px-8 pt-8 pb-6 border-b border-gray-100 dark:border-gray-800/60">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-[0.4rem] bg-[#0f172a] dark:bg-white flex items-center justify-center shrink-0">
                  <span className="text-white dark:text-[#0f172a] font-bold text-xl">B</span>
                </div>
                <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white leading-none">BEIS</h1>
              </div>
              <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.12em] mt-2.5 whitespace-nowrap">
                BE Integrated Services
              </span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 text-gray-400 hover:text-gray-600 -mt-1">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto space-y-1.5 px-4 pt-6 py-4 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path + '/') && item.path !== '/');
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gray-900 text-white shadow-md dark:bg-blue-600'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
                }`}
              >
                <svg className={`w-5 h-5 shrink-0 ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={item.icon} />
                </svg>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Pinned Actions */}
        <div className="shrink-0 p-4 space-y-1.5 border-t border-gray-100 dark:border-gray-800/60 mt-auto">
          <button onClick={() => setIsNotifMenuOpen(!isNotifMenuOpen)} className="w-full group flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 shrink-0 opacity-70 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Notifications
            </div>
            {unreadCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          <Link to="/support" className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white">
            <svg className="w-5 h-5 shrink-0 opacity-70 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Help & Support
          </Link>

          <button onClick={handleLogout} className="w-full group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400">
            <svg className="w-5 h-5 shrink-0 opacity-70 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex h-24 shrink-0 items-center justify-between px-4 sm:px-8 z-10 transition-colors duration-200">
          
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 -ml-2 text-gray-400 hover:bg-white rounded-xl transition-colors shadow-sm lg:hidden">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            
            <div className="hidden sm:block">
              <h1 className={`${location.pathname === '/' ? 'text-3xl' : 'text-2xl font-bold'} text-gray-900 dark:text-white tracking-tight`}>
                {headerInfo.title}
              </h1>
              {headerInfo.sub && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {headerInfo.sub}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* Theme Toggle */}
            <div className="flex items-center bg-white dark:bg-gray-800 rounded-full p-1 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.06)] border border-gray-100 dark:border-gray-700">
              <button 
                onClick={() => setIsDarkMode(true)} 
                className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200 ${isDarkMode ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-md' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              </button>
              <button 
                onClick={() => setIsDarkMode(false)} 
                className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200 ${!isDarkMode ? 'bg-gray-900 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </button>
            </div>

            {/* Notification Bell */}
            <button className="relative h-10 w-10 flex items-center justify-center text-gray-500 bg-white hover:text-gray-900 dark:bg-gray-800 dark:text-gray-300 dark:hover:text-white rounded-full shadow-[0_2px_10px_-3px_rgba(0,0,0,0.06)] border border-gray-100 dark:border-gray-700 transition-all">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              {unreadCount > 0 && <span className="absolute top-2 right-2.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"></span>}
            </button>
            
            {/* User Avatar */}
            <div className="h-10 w-10 shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shadow-sm border-2 border-white dark:border-gray-900 overflow-hidden">
              {user?.avatar_path ? (
                <img src={`http://localhost:8000/storage/${user.avatar_path}`} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span>{user?.name?.charAt(0) || 'U'}</span>
              )}
            </div>
            
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 pb-10">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
}