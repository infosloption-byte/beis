import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../lib/axios';

export default function JobCalendar() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Calendar State - Default set to 'month'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // 'day', 'week', 'month'

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await axios.get('/api/jobs');
      // Filter out jobs that don't have a start_date
      setJobs(response.data.filter(j => j.start_date !== null));
    } catch (err) {
      console.error('Failed to load jobs for Calendar', err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- NAVIGATION LOGIC ---
  const next = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') newDate.setMonth(newDate.getMonth() + 1);
    if (view === 'week') newDate.setDate(newDate.getDate() + 7);
    if (view === 'day') newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const prev = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') newDate.setMonth(newDate.getMonth() - 1);
    if (view === 'week') newDate.setDate(newDate.getDate() - 7);
    if (view === 'day') newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const today = () => setCurrentDate(new Date());

  // --- DATE MATH HELPERS ---
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  
  const getWeekDays = (date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay()); // Set to Sunday
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  };

  const weekDays = getWeekDays(currentDate);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // --- DYNAMIC HEADER TITLE ---
  const getHeaderTitle = () => {
    if (view === 'month') {
      return `${monthNames[month]} ${year}`;
    } else if (view === 'week') {
      const start = weekDays[0];
      const end = weekDays[6];
      if (start.getMonth() === end.getMonth()) {
        return `${start.getDate()} - ${end.getDate()} ${monthNames[start.getMonth()]} ${start.getFullYear()}`;
      } else {
        return `${monthNames[start.getMonth()]} ${start.getDate()} - ${monthNames[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
      }
    } else {
      return currentDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
  };

  // --- STYLING HELPERS (Solid Vibrant Colors) ---
  const getEventStyles = (job) => {
    if (job.priority === 'Emergency' && !['Completed', 'Closed'].includes(job.status)) {
      return 'bg-rose-500 text-white hover:bg-rose-600 shadow-md'; // Red/Pink
    }
    switch (job.status) {
      case 'In-Progress': return 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-md'; // Purple
      case 'Scheduled': return 'bg-blue-500 text-white hover:bg-blue-600 shadow-md'; // Blue
      case 'Completed': return 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md opacity-90'; // Green
      default: return 'bg-amber-400 text-gray-900 hover:bg-amber-500 shadow-md'; // Yellow (Requested/On-Hold)
    }
  };

  const isSameDay = (d1, d2) => d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();

  // Helper to format time like "09.30 AM"
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).replace(':', '.');
  };

  // --- RENDER VIEWS ---
  const renderMonthView = () => (
    <div className="border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden bg-gray-50/50 dark:bg-gray-800/20 animate-in fade-in duration-300">
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 pt-4 pb-2">
        {daysOfWeek.map(day => (
          <div key={day} className="text-center text-sm font-bold text-gray-500 dark:text-gray-400">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 auto-rows-fr">
        {[...Array(firstDayOfMonth)].map((_, i) => (
          <div key={`blank-${i}`} className="min-h-[140px] bg-gray-50/30 dark:bg-gray-900/10 border-b border-r border-gray-200 dark:border-gray-800 p-2"></div>
        ))}
        {[...Array(daysInMonth)].map((_, i) => {
          const dateObj = new Date(year, month, i + 1);
          const isToday = isSameDay(dateObj, new Date());
          const dayJobs = jobs.filter(j => isSameDay(new Date(j.start_date), dateObj));

          return (
            <div key={i + 1} className={`min-h-[140px] border-b border-r border-gray-200 dark:border-gray-800 p-2 transition-colors ${isToday ? 'bg-blue-50/30 dark:bg-blue-900/10' : 'bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/40'}`}>
              <div className="flex justify-center items-start mb-3 mt-1">
                <span className={`flex items-center justify-center h-8 w-8 rounded-xl text-sm font-bold ${isToday ? 'bg-blue-500 text-white shadow-md' : 'text-gray-700 dark:text-gray-300'}`}>
                  {i + 1}
                </span>
              </div>
              <div className="flex flex-col gap-2 overflow-y-auto max-h-[100px] custom-scrollbar pr-1">
                {dayJobs.map(job => (
                  <Link key={job.id} to={`/jobs/${job.id}`} className={`block px-2.5 py-2 rounded-lg text-[11px] font-bold truncate transition-all ${getEventStyles(job)}`} title={`${job.title}`}>
                    <span className="opacity-90 mr-1.5">{formatTime(job.start_date)}</span>
                    {job.title}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderWeekView = () => (
    <div className="border border-gray-200 dark:border-gray-800 rounded-3xl overflow-x-auto bg-white dark:bg-gray-900 custom-scrollbar animate-in fade-in duration-300 shadow-sm">
      <div className="min-w-[900px] grid grid-cols-7 divide-x divide-gray-200 dark:divide-gray-800">
        {weekDays.map((date, i) => {
          const isToday = isSameDay(date, new Date());
          const dayJobs = jobs.filter(j => isSameDay(new Date(j.start_date), date));
          
          return (
            <div key={i} className="min-h-[600px] flex flex-col">
              {/* Header */}
              <div className="p-4 text-center border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className={`mx-auto flex flex-col items-center justify-center rounded-2xl w-14 h-16 transition-colors ${isToday ? 'bg-blue-500 text-white shadow-md' : 'text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                  <span className="text-xl font-black leading-tight">{date.getDate()}</span>
                  <span className={`text-[10px] font-bold ${isToday ? 'text-blue-100' : 'text-gray-500'}`}>{daysOfWeek[date.getDay()]}</span>
                </div>
              </div>
              
              {/* Body */}
              <div className={`flex-1 p-3 space-y-3 ${isToday ? 'bg-blue-50/10 dark:bg-blue-900/5' : 'bg-gray-50/20 dark:bg-gray-900/50'}`}>
                {dayJobs.sort((a, b) => new Date(a.start_date) - new Date(b.start_date)).map(job => (
                  <Link key={job.id} to={`/jobs/${job.id}`} className={`block p-4 rounded-2xl transition-all hover:scale-[1.02] ${getEventStyles(job)}`}>
                    <div className="text-sm font-bold leading-tight mb-2 line-clamp-2">{job.title}</div>
                    <div className="text-[11px] font-semibold opacity-90 mb-2">
                      Client: {job.client?.name.split(' ')[0] || 'N/A'}
                    </div>
                    <div className="text-[11px] font-bold opacity-90 mb-3">
                      {formatTime(job.start_date)} - {job.end_date ? formatTime(job.end_date) : 'TBD'}
                    </div>
                    <div className="mt-auto pt-2 border-t border-black/10 dark:border-white/10">
                      <span className="text-[10px] font-bold opacity-80 line-clamp-1">
                        Note: {job.property?.name}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderDayView = () => {
    const dayJobs = jobs.filter(j => isSameDay(new Date(j.start_date), currentDate));
    const hours = Array.from({ length: 24 }).map((_, i) => i);

    return (
      <div className="border border-gray-200 dark:border-gray-800 rounded-3xl bg-white dark:bg-gray-900 overflow-hidden animate-in fade-in duration-300 shadow-sm">
        <div className="flex flex-col h-[700px] overflow-y-auto custom-scrollbar relative">
          {hours.map(hour => {
            const jobsInHour = dayJobs.filter(j => new Date(j.start_date).getHours() === hour);
            const isBusinessHour = hour >= 8 && hour <= 18;

            return (
              <div key={hour} className="flex min-h-[100px] border-b border-gray-100 dark:border-gray-800/60 last:border-b-0 group">
                {/* Time Gutter */}
                <div className={`w-24 shrink-0 text-right pr-4 py-4 text-xs font-bold ${isBusinessHour ? 'text-gray-900 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600'}`}>
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                </div>
                {/* Event Area */}
                <div className={`flex-1 p-3 border-l border-gray-100 dark:border-gray-800 flex gap-3 ${!isBusinessHour ? 'bg-gray-50/50 dark:bg-gray-900/50' : 'bg-white dark:bg-gray-900'}`}>
                  {jobsInHour.map(job => (
                    <Link key={job.id} to={`/jobs/${job.id}`} className={`flex-1 flex flex-col p-4 rounded-2xl transition-all hover:scale-[1.01] ${getEventStyles(job)}`}>
                      <div className="text-base font-bold leading-tight mb-1">{job.title}</div>
                      <div className="text-[11px] font-semibold opacity-90 mb-2">
                        {job.property?.name} • {job.client?.name.split(' ')[0]}
                      </div>
                      <div className="text-[11px] font-bold opacity-90">
                        {formatTime(job.start_date)} - {job.end_date ? formatTime(job.end_date) : 'TBD'}
                      </div>
                      {job.technician && (
                        <div className="mt-auto pt-3 flex items-center gap-2 text-[11px] font-bold opacity-90">
                           <div className="h-6 w-6 rounded-full bg-black/20 flex items-center justify-center text-[10px]">
                             {job.technician.name.charAt(0)}
                           </div>
                           Assigned to {job.technician.name.split(' ')[0]}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div></div>;

  return (
    <div className="max-w-7xl mx-auto pt-2 pb-12 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-gray-800">
        
        {/* --- COLORFUL LEGEND (Moved to Top) --- */}
        <div className="mb-8 flex flex-wrap gap-4 items-center justify-center lg:justify-start text-xs font-bold text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-md bg-amber-400 shadow-sm"></span> Requested / On-Hold</div>
          <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-md bg-blue-500 shadow-sm"></span> Scheduled</div>
          <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-md bg-indigo-500 shadow-sm"></span> In-Progress</div>
          <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-md bg-rose-500 shadow-sm"></span> Emergency</div>
          <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-md bg-emerald-500 opacity-90 shadow-sm"></span> Completed</div>
        </div>

        {/* Top Controls Area */}
        <div className="flex flex-col lg:flex-row items-center justify-between mb-8 gap-6">
          
          {/* Left: Date Display & Nav */}
          <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-start">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight min-w-[200px]">
              {getHeaderTitle()}
            </h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-gray-50 dark:bg-gray-800 p-1 rounded-2xl border border-gray-200/60 dark:border-gray-700">
                <button onClick={prev} className="p-2 text-gray-500 hover:bg-white hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white rounded-xl transition-all shadow-sm">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={today} className="px-4 py-2 text-sm font-black text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase tracking-wider">
                  Today
                </button>
                <button onClick={next} className="p-2 text-gray-500 hover:bg-white hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white rounded-xl transition-all shadow-sm">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          </div>

          {/* Right: View Switcher */}
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl w-full lg:w-fit shrink-0 border border-gray-200/50 dark:border-gray-700">
            <button onClick={() => setView('day')} className={`flex-1 lg:flex-none px-6 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${view === 'day' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>Day</button>
            <button onClick={() => setView('week')} className={`flex-1 lg:flex-none px-6 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${view === 'week' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>Week</button>
            <button onClick={() => setView('month')} className={`flex-1 lg:flex-none px-6 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${view === 'month' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>Month</button>
          </div>
        </div>

        {/* Dynamic View Rendering */}
        <div className="w-full">
          {view === 'month' && renderMonthView()}
          {view === 'week' && renderWeekView()}
          {view === 'day' && renderDayView()}
        </div>

      </div>
    </div>
  );
}