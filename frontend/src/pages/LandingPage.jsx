import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-white font-sans selection:bg-blue-500 selection:text-white overflow-hidden transition-colors duration-300">
      
      {/* --- AMBIENT BACKGROUND GLOWS --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 dark:bg-blue-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 dark:bg-purple-600/10 blur-[120px] pointer-events-none"></div>

      {/* --- NAVIGATION --- */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto animate-in fade-in duration-500">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#0f172a] dark:bg-white flex items-center justify-center shrink-0 shadow-lg">
            <span className="text-white dark:text-[#0f172a] font-black text-xl">B</span>
          </div>
          <span className="text-2xl font-black tracking-tight">BEIS</span>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link to="/dashboard" className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="hidden sm:block text-sm font-bold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                Employee Sign In
              </Link>
              <Link to="/login" className="text-sm font-bold text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:opacity-90 px-6 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md">
                Client Portal &rarr;
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4 pt-20 pb-24 text-center max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-8 border border-gray-200 dark:border-gray-800 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Next-Generation Facility Management
        </div>
        
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6">
          Intelligent operations for <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">modern properties.</span>
        </h1>
        
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl font-medium leading-relaxed">
          BE Integrated Services brings your job sites, field technicians, and client requests into one powerful, real-time command center.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link to="/login" className="w-full sm:w-auto text-base font-bold text-white bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-2xl transition-all shadow-lg hover:shadow-blue-600/25 flex items-center justify-center gap-2">
            Access Command Center <span aria-hidden="true">&rarr;</span>
          </Link>
          <a href="#features" className="w-full sm:w-auto text-base font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 px-8 py-4 rounded-2xl transition-all shadow-sm flex items-center justify-center">
            Explore Capabilities
          </a>
        </div>

        {/* HERO IMAGE SHOWCASE (Main Dashboard) */}
        <div className="mt-20 w-full max-w-5xl relative">
          <div className="rounded-[2rem] border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl p-2 sm:p-4 overflow-hidden transform perspective-1000 rotateX-12 scale-95 origin-bottom transition-transform hover:scale-100 hover:rotate-0 duration-700">
             
             {/* PLACEHOLDER FOR YOUR DASHBOARD SCREENSHOT */}
             {/* Save your screenshot as "dashboard.png" in your frontend/public folder */}
             <img 
               src="/dashboard.png" 
               alt="BEIS Main Dashboard" 
               className="w-full h-auto rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-100 dark:bg-gray-950 object-cover min-h-[300px]"
               // Fallback if image doesn't exist yet:
               onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2070'; }} 
             />

          </div>
        </div>
      </main>

      {/* --- HOW IT WORKS (WORKFLOW) --- */}
      <section className="relative z-10 bg-white dark:bg-gray-900 py-24 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">The BEIS Workflow</h2>
            <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white">From request to resolution in record time.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connecting Line (Hidden on mobile) */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gray-100 dark:bg-gray-800 z-0"></div>

            {[
              { step: '01', title: 'Client Logs Request', desc: 'Clients use their dedicated portal to report issues at their specific properties with photo evidence.', icon: 'M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122' },
              { step: '02', title: 'Admin Dispatches', desc: 'Operations managers view the unassigned queue and assign the best technician based on skill and availability.', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
              { step: '03', title: 'Tech Resolves', desc: 'Field technicians receive the job, travel to the site, fix the issue, and update the status via their mobile dashboard.', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
              { step: '04', title: 'System Logs Time', desc: 'The platform automatically calculates hours worked for the technician\'s timesheet and notifies the client.', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
            ].map((item, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-900 border-4 border-gray-50 dark:border-gray-950 shadow-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 relative">
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">{item.step}</span>
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />{item.step === '03' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />}</svg>
                </div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.title}</h4>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">Everything you need to scale operations.</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto">Stop managing chaotic WhatsApp groups and spreadsheets. BEIS provides a unified structure for your entire facility maintenance team.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {[
            { title: 'Interactive Kanban Boards', color: 'blue', desc: 'Visually track work orders from request to completion. Drag and drop cards to update statuses instantly across the network.', icon: 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2' },
            { title: 'Automated Timesheets', color: 'purple', desc: 'Eliminate manual entry. The system automatically calculates technician hours based on precise work order start and end times.', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
            { title: 'Secure Client Portals', color: 'emerald', desc: 'Give your clients full transparency. Dedicated roles allow clients to log requests and monitor their property portfolios securely.', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
            { title: 'Smart Dispatching', color: 'orange', desc: 'View technician availability in real-time. The Air and Fill tables show you exactly who is idle and who is currently deployed.', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
            { title: 'Service Timelines', color: 'indigo', desc: 'Maintain a strict audit log of every job. See exactly when a job was assigned, updated, and completed, and by whom.', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
            { title: 'Role-Based Access', color: 'rose', desc: 'Enterprise-grade security ensures that technicians only see their assigned work, while admins maintain a bird\'s-eye view.', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
          ].map((feature, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-900/50 rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-gray-800 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
              <div className={`h-14 w-14 rounded-2xl bg-${feature.color}-50 dark:bg-${feature.color}-900/20 flex items-center justify-center text-${feature.color}-600 dark:text-${feature.color}-400 mb-6 border border-${feature.color}-100 dark:border-${feature.color}-800/50 group-hover:scale-110 transition-transform`}>
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} /></svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed font-medium">
                {feature.desc}
              </p>
            </div>
          ))}

        </div>
      </section>

      {/* --- STATS BANNER --- */}
      <section className="relative z-10 bg-blue-600 dark:bg-blue-900 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-blue-500/30 dark:divide-blue-800/50">
            <div className="text-center">
              <h4 className="text-4xl sm:text-5xl font-black text-white mb-2">99%</h4>
              <p className="text-blue-200 text-sm font-bold uppercase tracking-wider">Uptime SLA</p>
            </div>
            <div className="text-center">
              <h4 className="text-4xl sm:text-5xl font-black text-white mb-2">24/7</h4>
              <p className="text-blue-200 text-sm font-bold uppercase tracking-wider">Live Dispatch</p>
            </div>
            <div className="text-center">
              <h4 className="text-4xl sm:text-5xl font-black text-white mb-2">0</h4>
              <p className="text-blue-200 text-sm font-bold uppercase tracking-wider">Paper Forms</p>
            </div>
            <div className="text-center">
              <h4 className="text-4xl sm:text-5xl font-black text-white mb-2">10x</h4>
              <p className="text-blue-200 text-sm font-bold uppercase tracking-wider">Faster Resolution</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- BOTTOM CTA --- */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-24 sm:py-32 text-center">
        <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-6">Ready to streamline your facilities?</h2>
        <p className="text-lg text-gray-500 dark:text-gray-400 font-medium mb-10 max-w-2xl mx-auto">
          Join top property managers and service networks who rely on BEIS to keep their physical assets running smoothly.
        </p>
        <Link to="/login" className="inline-flex items-center justify-center gap-2 text-lg font-bold text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:scale-105 px-10 py-5 rounded-2xl transition-all shadow-xl hover:shadow-2xl">
          Log In to Your Portal <span aria-hidden="true">&rarr;</span>
        </Link>
      </section>

      {/* --- FOOTER --- */}
      <footer className="relative z-10 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                <span className="text-white font-black">B</span>
              </div>
              <span className="font-black text-xl tracking-tight">BEIS</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium max-w-sm leading-relaxed">
              BE Integrated Services provides enterprise-grade tools for modern property management, maintenance dispatch, and operational analytics.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-4">Platform</h4>
            <ul className="space-y-3 text-sm font-medium text-gray-500 dark:text-gray-400">
              <li><Link to="/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Admin Dashboard</Link></li>
              <li><Link to="/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Employee Portal</Link></li>
              <li><Link to="/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Client Access</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-4">Company</h4>
            <ul className="space-y-3 text-sm font-medium text-gray-500 dark:text-gray-400">
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact Support</a></li>
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-gray-100 dark:border-gray-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm font-medium text-gray-400">&copy; {new Date().getFullYear()} BE Integrated Services. All rights reserved.</span>
          <div className="flex items-center gap-4 text-gray-400">
            {/* Social Icons (Placeholders) */}
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg></a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg></a>
          </div>
        </div>
      </footer>

    </div>
  );
}