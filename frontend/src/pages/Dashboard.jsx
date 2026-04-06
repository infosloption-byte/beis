import { useState, useEffect } from 'react';
import axios from '../lib/axios';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid
} from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for the Alignment Chart filter
  const [chartView, setChartView] = useState('trend_7_days'); 

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('/api/dashboard/stats');
        setData(response.data);
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Simple function to generate calendar grid for the current month
  const generateCalendar = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday
    
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null); // Empty slots
    for (let i = 1; i <= daysInMonth; i++) {
      const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayJobs = data?.calendar?.filter(j => j.created_at.startsWith(dayStr)) || [];
      days.push({ day: i, jobs: dayJobs });
    }
    return days;
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const calendarDays = generateCalendar();
  const chartData = data?.charts?.[chartView] || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pt-4 pb-12">
      
      {/* 5-Point KPI Row (Updated to match Premium Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <KPICard 
          title="Total Jobs" 
          value={kpis.total_jobs} 
          colorTheme="slate" 
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
        />
        <KPICard 
          title="Completed Jobs" 
          value={kpis.completed_jobs} 
          colorTheme="green" 
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <KPICard 
          title="Pending / WIP" 
          value={kpis.pending_jobs} 
          colorTheme="blue" 
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <KPICard 
          title="Job Requests" 
          value={kpis.requested_jobs} 
          colorTheme="orange" 
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>}
        />
        <KPICard 
          title="Not Assigned" 
          value={kpis.unassigned_jobs} 
          colorTheme="red" 
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Span 2): Job Alignments Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] col-span-1 lg:col-span-2 flex flex-col relative">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Job Alignments</h3>
            <select 
              value={chartView} 
              onChange={(e) => setChartView(e.target.value)}
              className="rounded-full border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 px-4 py-1.5 focus:ring-0 cursor-pointer"
            >
              <option value="trend_7_days">Last 7 Days</option>
              <option value="trend_month">This Month</option>
              <option value="trend_year">This Year</option>
            </select>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="created" name="Jobs Created" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="completed" name="Jobs Finished" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column (Span 1): Mini Calendar */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="grid grid-cols-7 gap-2 text-center mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} className="text-xs font-bold text-gray-400">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2 flex-1 auto-rows-fr">
            {calendarDays.map((item, i) => (
              item === null ? (
                <div key={`empty-${i}`} />
              ) : (
                <div key={item.day} className={`relative flex items-center justify-center rounded-xl text-sm font-medium border ${item.jobs.length > 0 ? 'border-blue-100 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-900/10' : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                  {item.day}
                  {item.jobs.length > 0 && (
                    <span className="absolute bottom-1 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  )}
                </div>
              )
            ))}
          </div>
        </div>

      </div>

      {/* Full Width Row: Staff Summary */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Employee Performance & Status</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Employee Name</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Total Assigned</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Completed</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Live Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {data?.employees?.length === 0 ? (
                <tr><td colSpan="4" className="py-6 text-center text-gray-500">No active employees found.</td></tr>
              ) : (
                data?.employees?.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                          {emp.name.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{emp.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-600 dark:text-gray-300">
                      {emp.assigned}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-600 dark:text-gray-300">
                      {emp.completed}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                        emp.status === 'Working' 
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {emp.status === 'Working' && <span className="mr-1.5 flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>}
                        {emp.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

// Premium KPI Card Component matching User Reference
function KPICard({ title, value, icon, colorTheme }) {
  // Map color themes to the specific Tailwind classes for backgrounds, text, and trend pills
  const themes = {
    green: { iconBg: 'bg-emerald-50 dark:bg-emerald-500/10', iconText: 'text-emerald-600 dark:text-emerald-400', trendBg: 'bg-emerald-50 dark:bg-emerald-500/10', trendText: 'text-emerald-600 dark:text-emerald-400', isPositive: true },
    blue: { iconBg: 'bg-blue-50 dark:bg-blue-500/10', iconText: 'text-blue-600 dark:text-blue-400', trendBg: 'bg-blue-50 dark:bg-blue-500/10', trendText: 'text-blue-600 dark:text-blue-400', isPositive: true },
    orange: { iconBg: 'bg-orange-50 dark:bg-orange-500/10', iconText: 'text-orange-600 dark:text-orange-400', trendBg: 'bg-red-50 dark:bg-red-500/10', trendText: 'text-red-600 dark:text-red-400', isPositive: false },
    red: { iconBg: 'bg-red-50 dark:bg-red-500/10', iconText: 'text-red-600 dark:text-red-400', trendBg: 'bg-red-50 dark:bg-red-500/10', trendText: 'text-red-600 dark:text-red-400', isPositive: false },
    slate: { iconBg: 'bg-slate-100 dark:bg-slate-800', iconText: 'text-slate-600 dark:text-slate-400', trendBg: 'bg-emerald-50 dark:bg-emerald-500/10', trendText: 'text-emerald-600 dark:text-emerald-400', isPositive: true },
  };
  const theme = themes[colorTheme] || themes.slate;

  // Mock previous month data for the UI visual
  const previousValue = Math.floor((value || 0) * 0.8);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 dark:border-gray-800 flex flex-col justify-between transition-all hover:shadow-[0_4px_25px_rgb(0,0,0,0.06)]">
      
      {/* Top Row: Icon & Title & Three Dots */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${theme.iconBg} ${theme.iconText}`}>
            {icon}
          </div>
          <span className="text-[16px] font-semibold text-gray-700 dark:text-gray-300">{title}</span>
        </div>
        <button className="h-8 w-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      {/* Bottom Row: Value & Trend Pill */}
      <div className="flex items-baseline gap-3">
        <span className="text-[32px] font-bold text-gray-900 dark:text-white leading-none">{value || 0}</span>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-0.5 px-2 py-1 rounded-md text-[11px] font-bold tracking-wide ${theme.trendBg} ${theme.trendText}`}>
            {theme.isPositive ? (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M7 17L17 7M7 7h10v10" /></svg>
            ) : (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 7L7 17M17 17H7V7" /></svg>
            )}
            20%
          </span>
          <span className="text-[12px] font-medium text-gray-400 dark:text-gray-500 whitespace-nowrap">Last month total {previousValue}</span>
        </div>
      </div>
      
    </div>
  );
}