import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../lib/axios';
import { useAuthStore } from '../store/authStore';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = user?.roles?.some(r => r.name === 'Admin' || r === 'Admin');
  const isEmployee = user?.roles?.some(r => r.name === 'Employee' || r === 'Employee');
  const isClient = user?.roles?.some(r => r.name === 'Client' || r === 'Client');

  useEffect(() => {
    if (!user) return;
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        let endpoint = '/api/dashboard/operations';
        if (isEmployee) endpoint = '/api/dashboard/employee';
        if (isClient) endpoint = '/api/dashboard/client';
        const response = await axios.get(endpoint);
        setData(response.data);
      } catch (error) {
        console.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [user, isAdmin, isEmployee, isClient]);

  if (isLoading) return <div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div></div>;
  if (!data) return null;

  if (isAdmin) return <AdminView data={data} />;
  if (isEmployee) return <EmployeeView data={data} user={user} />;
  if (isClient) return <ClientView data={data} user={user} />;
  return null;
}

// ==========================================
// 1. EMPLOYEE DASHBOARD VIEW
// ==========================================
function EmployeeView({ data, user }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const isSameDay = (d1, d2) => d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
  
  const jobs = data.calendar_jobs || [];
  const selectedDayJobs = jobs.filter(j => isSameDay(new Date(j.start_date), selectedDate));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pt-2 pb-12 animate-in fade-in duration-300">
      
      {/* Welcome Header */}
      <div className="bg-blue-600 rounded-[2rem] p-8 sm:p-10 shadow-lg border border-blue-500 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="relative z-10 text-center sm:text-left">
          <span className="text-blue-200 font-bold uppercase tracking-wider text-sm mb-2 block">My Field Operations</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
            Ready for work, {user?.name?.split(' ')[0]}?
          </h2>
          <p className="text-blue-100 mt-2 font-medium">You have {data.stats.active_jobs} open work orders in your queue.</p>
        </div>
        <div className="relative z-10 shrink-0">
          {user?.avatar_path ? (
            <img src={`http://localhost:8000/storage/${user.avatar_path}`} alt="Avatar" className="h-24 w-24 rounded-full object-cover shadow-xl border-4 border-blue-400" />
          ) : (
            <div className="h-24 w-24 rounded-full bg-white text-blue-600 flex items-center justify-center text-3xl font-black shadow-xl">{user?.name?.charAt(0)}</div>
          )}
        </div>
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-500/50 blur-3xl pointer-events-none"></div>
      </div>

      {/* KPI Cards (Now 5 items) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-5 shadow-sm border border-gray-100 dark:border-gray-800">
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-wider mb-2 line-clamp-1">Active Jobs</p>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white">{data.stats.active_jobs}</h3>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-5 shadow-sm border border-gray-100 dark:border-gray-800">
          <p className="text-[10px] font-black text-red-500 uppercase tracking-wider mb-2 line-clamp-1">Emergencies</p>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white">{data.stats.emergency_jobs}</h3>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-5 shadow-sm border border-gray-100 dark:border-gray-800">
          <p className="text-[10px] font-black text-purple-500 uppercase tracking-wider mb-2 line-clamp-1">Active Sites</p>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white">{data.stats.active_sites}</h3>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-5 shadow-sm border border-gray-100 dark:border-gray-800">
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-wider mb-2 line-clamp-1">Month Hours</p>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-2">{data.stats.month_hours}</h3>
        </div>
        <div className="col-span-2 md:col-span-1 lg:col-span-1 bg-white dark:bg-gray-900 rounded-[1.5rem] p-5 shadow-sm border border-gray-100 dark:border-gray-800">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 line-clamp-1">Completed</p>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white">{data.stats.completed_jobs}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Work Queue */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-[600px]">
          <div className="flex justify-between items-start mb-6 shrink-0">
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">My Work Queue</h3>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-1">Jobs actively assigned to you</p>
            </div>
            <Link to="/jobs" className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-xl transition-colors">Go to Board</Link>
          </div>

          <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar pr-2">
            {data.my_queue.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <svg className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                <p className="text-sm font-bold">Your queue is completely clear!</p>
              </div>
            ) : (
              <div className="min-w-[600px] space-y-3">
                {data.my_queue.map(job => (
                  <div key={job.id} className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
                    <div className="w-[40%] min-w-0">
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider mb-2 ${job.priority === 'Emergency' ? 'bg-red-500 text-white' : job.priority === 'High' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                        {job.priority} Priority
                      </span>
                      <Link to={`/jobs/${job.id}`} className="text-[15px] font-bold text-gray-900 dark:text-white hover:text-blue-600 truncate block transition-colors">
                        <span className="text-gray-400 mr-1.5">#{job.id}</span>{job.title}
                      </Link>
                    </div>
                    
                    <div className="w-[25%] min-w-0">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Site</p>
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-300 truncate">{job.property?.name}</p>
                      <p className="text-[10px] font-medium text-gray-500 truncate">{job.property?.city}</p>
                    </div>

                    <div className="w-[20%]">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Schedule</p>
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">
                        {job.start_date ? new Date(job.start_date).toLocaleDateString(undefined, {month:'short', day:'numeric'}) : 'TBD'}
                      </p>
                    </div>
                    
                    <div className="w-[15%] text-right shrink-0">
                      <Link to={`/jobs/${job.id}`} className="inline-flex items-center justify-center px-4 py-2 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-xl text-xs font-bold hover:opacity-80 transition-opacity w-full shadow-sm">
                        Open Job
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mini Calendar Widget */}
        <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-[600px]">
          <div className="flex justify-between items-center mb-6 shrink-0">
            <h3 className="text-lg font-black text-gray-900 dark:text-white">My Schedule</h3>
            <Link to="/calendar" className="text-[10px] font-black text-gray-500 uppercase tracking-wider hover:text-blue-600 transition-colors">Full View &rarr;</Link>
          </div>

          <div className="flex justify-between items-center mb-4 shrink-0">
            <span className="font-black text-sm text-gray-900 dark:text-white">{monthNames[month]} {year}</span>
            <div className="flex gap-1 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800">
              <button onClick={prevMonth} className="px-2 py-1 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={nextMonth} className="px-2 py-1 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 mb-2 gap-1 text-center shrink-0">
            {daysOfWeek.map(d => <div key={d} className="text-[10px] font-black text-gray-400">{d}</div>)}
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center mb-4 shrink-0">
            {Array(firstDay).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
            {Array(daysInMonth).fill(null).map((_, i) => {
              const day = i + 1;
              const dateObj = new Date(year, month, day);
              const isToday = isSameDay(dateObj, new Date());
              const isSelected = isSameDay(dateObj, selectedDate);
              const hasJobs = jobs.some(j => isSameDay(new Date(j.start_date), dateObj));

              return (
                <button 
                  key={day} onClick={() => setSelectedDate(dateObj)}
                  className={`h-8 w-full rounded-lg text-[11px] font-bold flex items-center justify-center relative transition-all ${
                    isSelected ? 'bg-blue-600 text-white shadow-sm' : 
                    isToday ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 ring-1 ring-blue-200 dark:ring-blue-800' : 
                    'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {day}
                  {hasJobs && !isSelected && <span className="absolute bottom-1 w-1 h-1 bg-blue-400 rounded-full"></span>}
                  {hasJobs && isSelected && <span className="absolute bottom-1 w-1 h-1 bg-white rounded-full"></span>}
                </button>
              )
            })}
          </div>

          {/* Selected Day Agenda */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-4 flex-1 min-h-0 flex flex-col">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3 shrink-0">
              Agenda • {selectedDate.toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
            </p>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
              {selectedDayJobs.length === 0 ? (
                <p className="text-xs text-gray-400 font-medium italic mt-2">No work scheduled.</p>
              ) : (
                selectedDayJobs.map(job => (
                  <Link key={job.id} to={`/jobs/${job.id}`} className="block p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 transition-all group">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-black text-blue-600 dark:text-blue-400">{new Date(job.start_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      <span className={`text-[9px] font-black uppercase tracking-wider ${job.priority === 'Emergency' ? 'text-red-500' : 'text-gray-400'}`}>{job.priority}</span>
                    </div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-700 dark:group-hover:text-blue-300">{job.title}</p>
                  </Link>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

// ==========================================
// 2. CLIENT DASHBOARD VIEW
// ==========================================
function ClientView({ data, user }) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pt-2 pb-12 animate-in fade-in duration-300">
      <div className="bg-emerald-600 rounded-[2rem] p-8 sm:p-10 shadow-lg relative overflow-hidden text-white">
        <h2 className="text-3xl font-black relative z-10">Welcome, {user?.name}</h2>
        <p className="mt-2 font-medium relative z-10">Here is the status of your properties and maintenance requests.</p>
      </div>
    </div>
  );
}

// ==========================================
// 3. ADMIN OPERATIONS DASHBOARD (Finalized)
// ==========================================
function AdminView({ data }) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pt-2 pb-12 animate-in fade-in duration-300">
      {/* --- ROW 1: PROPERTIES TABLES --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Total Job Sites */}
        <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-80">
          <div className="flex justify-between items-start mb-4 shrink-0">
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                All Job Sites <span className="text-sm text-gray-400 font-medium ml-1">({data.properties.total})</span>
              </h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Recently Registered Sites</p>
            </div>
            <Link to="/properties" className="text-xs font-bold text-gray-600 hover:text-gray-900 dark:text-gray-400 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors">
              View All
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {data.properties.all_table.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm font-bold text-gray-400">No properties found.</div>
            ) : (
              <div className="space-y-2">
                {data.properties.all_table.map(prop => (
                  <div key={`all-${prop.id}`} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 border border-gray-200 dark:border-gray-700">
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{prop.name}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">{prop.type} • {prop.city}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Sites w/ Ongoing Work */}
        <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-[1.5rem] p-6 shadow-sm border border-blue-100 dark:border-blue-900/30 flex flex-col h-80">
          <div className="flex justify-between items-start mb-4 shrink-0">
            <div>
              <h3 className="text-lg font-black text-blue-900 dark:text-blue-400 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                Active Ops <span className="text-sm text-blue-600/70 font-medium ml-1">({data.properties.active_with_jobs_count})</span>
              </h3>
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mt-1">Sites with open work orders</p>
            </div>
            <Link to="/properties?status=Active&ongoing=true" className="text-xs font-bold text-blue-700 bg-blue-100 hover:bg-blue-200 dark:text-blue-300 dark:bg-blue-900/40 dark:hover:bg-blue-800/60 px-3 py-1.5 rounded-lg transition-colors">
              View All
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {data.properties.active_with_jobs_table.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm font-bold text-blue-400/60">No ongoing operations.</div>
            ) : (
              <div className="space-y-2">
                {data.properties.active_with_jobs_table.map(prop => (
                  <div key={`act-${prop.id}`} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-blue-100/50 dark:hover:bg-blue-900/20 transition-colors">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800/50">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-blue-900 dark:text-blue-100 truncate">{prop.name}</p>
                      <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider truncate">{prop.type} • {prop.city}</p>
                    </div>
                    <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded shadow-sm shrink-0">
                      {prop.active_jobs} Jobs
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Closed / Inactive Sites */}
        <div className="bg-gray-50 dark:bg-gray-800/30 rounded-[1.5rem] p-6 shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col h-80">
          <div className="flex justify-between items-start mb-4 shrink-0">
            <div>
              <h3 className="text-lg font-black text-gray-700 dark:text-gray-300">
                Closed Sites <span className="text-sm text-gray-400 font-medium ml-1">({data.properties.closed_count})</span>
              </h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Inactive Properties</p>
            </div>
            <Link to="/properties?status=Inactive" className="text-xs font-bold text-red-600 hover:text-red-800 dark:text-red-400 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 px-3 py-1.5 rounded-lg transition-colors">
              View All
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {data.properties.closed_table.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm font-bold text-gray-400">No closed sites.</div>
            ) : (
              <div className="space-y-2">
                {data.properties.closed_table.map(prop => (
                  <div key={`cls-${prop.id}`} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-colors opacity-80 grayscale-[50%]">
                    <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0 border border-gray-300 dark:border-gray-600">
                      <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-600 dark:text-gray-400 truncate">{prop.name}</p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider truncate">{prop.type} • {prop.city}</p>
                    </div>
                    <span className="text-[10px] font-bold bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300 px-2 py-0.5 rounded shrink-0">
                      Inactive
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- ROW 2: AIR TABLE & FILL TABLE --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* AIR TABLE */}
        <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-[400px]">
          <div className="flex justify-between items-start mb-6 shrink-0">
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-emerald-50 dark:ring-emerald-900/30"></span>
                Air Table <span className="text-sm text-gray-400 font-medium ml-1">({data.employees.air_count} Available)</span>
              </h3>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-1">Employees with ZERO Active Work Orders</p>
            </div>
            <Link to="/users?role=Employee&availability=air" className="text-xs font-bold text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-lg transition-colors">
              View Directory
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {data.employees.air_table.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <p className="text-sm font-bold">No available employees.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.employees.air_table.map(emp => (
                  <div key={emp.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-colors">
                    {emp.avatar_path ? (
                      <img src={`http://localhost:8000/storage/${emp.avatar_path}`} alt="Avatar" className="h-10 w-10 rounded-full object-cover shadow-sm border border-gray-200 dark:border-gray-700" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-sm border border-emerald-200 dark:border-emerald-800/50">{emp.name.charAt(0)}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{emp.name}</p>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-0.5 truncate">{emp.profession || 'Field Tech'}</p>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded-md shrink-0 border border-emerald-100 dark:border-emerald-800/50">Available</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* FILL TABLE */}
        <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-[400px]">
          <div className="flex justify-between items-start mb-6 shrink-0">
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-orange-500 ring-4 ring-orange-50 dark:ring-orange-900/30"></span>
                Fill Table <span className="text-sm text-gray-400 font-medium ml-1">({data.employees.fill_count} Busy)</span>
              </h3>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-1">Employees Currently Deployed</p>
            </div>
            <Link to="/users?role=Employee&availability=fill" className="text-xs font-bold text-orange-600 hover:text-orange-800 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-3 py-1.5 rounded-lg transition-colors">
              View Directory
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {data.employees.fill_table.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <p className="text-sm font-bold">No active jobs assigned.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.employees.fill_table.map(emp => (
                  <div key={emp.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-colors">
                    {emp.avatar_path ? (
                      <img src={`http://localhost:8000/storage/${emp.avatar_path}`} alt="Avatar" className="h-10 w-10 rounded-full object-cover shadow-sm border border-gray-200 dark:border-gray-700" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-700 dark:text-orange-400 font-bold text-sm border border-orange-200 dark:border-orange-800/50">{emp.name.charAt(0)}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{emp.name}</p>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-0.5 truncate">{emp.profession || 'Field Tech'}</p>
                    </div>
                    <span className="text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/50 px-2 py-1 rounded-md shrink-0 shadow-sm">
                      {emp.active_jobs} Active
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- ROW 3: UNASSIGNED WORK ORDERS --- */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col">
          <div className="flex justify-between items-start mb-6 shrink-0">
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500 ring-4 ring-red-50 dark:ring-red-900/30 animate-pulse"></span>
                Unassigned Work Orders <span className="text-sm text-gray-400 font-medium ml-1">({data.jobs.unassigned_count} Pending)</span>
              </h3>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-1">Jobs requiring immediate technician dispatch</p>
            </div>
            <Link to="/jobs?status=Unassigned" className="text-xs font-bold text-red-600 hover:text-red-800 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-3 py-1.5 rounded-lg transition-colors">
              View Dispatch Board
            </Link>
          </div>
          
          <div className="flex-1 overflow-x-auto pr-2 custom-scrollbar">
            {data.jobs.unassigned_table.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                <p className="text-sm font-bold">All active jobs are currently assigned.</p>
              </div>
            ) : (
              <div className="min-w-[700px] space-y-3">
                {data.jobs.unassigned_table.map(job => (
                  <div key={job.id} className="flex items-center justify-between gap-4 p-4 rounded-xl bg-gray-50/50 hover:bg-gray-50 dark:bg-gray-800/30 dark:hover:bg-gray-800/50 border border-gray-100 dark:border-gray-700 transition-colors">
                    
                    <div className="flex items-center gap-4 min-w-0 w-[40%]">
                      <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      </div>
                      <div className="min-w-0">
                        <Link to={`/jobs/${job.id}`} className="text-sm font-bold text-gray-900 dark:text-white hover:text-blue-600 truncate block">
                          <span className="text-blue-600 dark:text-blue-400 mr-1.5">#{job.id}</span>{job.title}
                        </Link>
                        <p className="text-[11px] font-bold text-gray-500 mt-0.5 truncate">{job.property?.name || 'Unknown Property'}</p>
                      </div>
                    </div>
                    
                    <div className="w-[20%]">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Priority</p>
                      <span className={`text-[11px] font-black uppercase tracking-wider ${
                          job.priority === 'Emergency' ? 'text-red-600 dark:text-red-400' :
                          job.priority === 'High' ? 'text-orange-500 dark:text-orange-400' :
                          job.priority === 'Medium' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'
                      }`}>{job.priority}</span>
                    </div>

                    <div className="w-[20%]">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Client</p>
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">{job.client?.name}</p>
                    </div>
                    
                    <div className="w-[20%] text-right shrink-0">
                      <Link to={`/jobs/${job.id}`} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 text-xs font-bold transition-colors">
                        Assign Tech <span aria-hidden="true">&rarr;</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}