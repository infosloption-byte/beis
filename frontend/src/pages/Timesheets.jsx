import { useState, useEffect } from 'react';
import axios from '../lib/axios';
import CustomSelect from '../components/CustomSelect';
import { useAuthStore } from '../store/authStore';

export default function Timesheets() {
  const { user } = useAuthStore();
  const isAdmin = user?.roles?.some(r => r.name === 'Admin' || r === 'Admin');
  const isEmployee = user?.roles?.some(r => r.name === 'Employee' || r === 'Employee');
  const isClient = user?.roles?.some(r => r.name === 'Client' || r === 'Client');

  const [employees, setEmployees] = useState([]);
  const [timesheetData, setTimesheetData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Auto-set the employee ID if the user is an employee (and not an admin)
  const defaultEmployeeId = (isEmployee && !isAdmin) ? String(user.id) : '';

  const [filters, setFilters] = useState({
    employee_id: defaultEmployeeId,
    month: String(currentMonth),
    year: String(currentYear)
  });

  const months = [
    { value: '1', label: 'January' }, { value: '2', label: 'February' },
    { value: '3', label: 'March' }, { value: '4', label: 'April' },
    { value: '5', label: 'May' }, { value: '6', label: 'June' },
    { value: '7', label: 'July' }, { value: '8', label: 'August' },
    { value: '9', label: 'September' }, { value: '10', label: 'October' },
    { value: '11', label: 'November' }, { value: '12', label: 'December' },
  ];

  const years = Array.from({ length: 5 }).map((_, i) => ({
    value: String(currentYear - i),
    label: String(currentYear - i)
  }));

  // Only admins need to fetch the full employee list
  useEffect(() => {
    if (isAdmin) {
      fetchEmployees();
    }
  }, [isAdmin]);

  // Fetch timesheet whenever filters change (if an employee is selected)
  useEffect(() => {
    if (filters.employee_id && !isClient) {
      fetchTimesheet();
    } else {
      setTimesheetData(null);
    }
  }, [filters, isClient]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/api/users');
      const techs = response.data.filter(u => u.roles?.some(r => r.name === 'Employee'));
      setEmployees(techs);
    } catch (err) {
      console.error('Failed to load employees', err);
    }
  };

  const fetchTimesheet = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.get('/api/timesheets', { params: filters });
      setTimesheetData(response.data);
    } catch (err) {
      setError('Failed to load timesheet data. You may not have permission.');
      setTimesheetData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const formatMinutes = (totalMinutes) => {
    if (totalMinutes === 0) return '0h 0m';
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}h ${m}m`;
  };

  // Hard Block for Clients
  if (isClient) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center animate-in fade-in">
        <svg className="w-16 h-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Access Denied</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Clients do not have access to internal timesheets.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pt-2 pb-12 animate-in fade-in duration-300">
      
      {/* FILTER BAR */}
      <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className={`grid grid-cols-1 ${isAdmin ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-6`}>
          
          {/* Only Admins can select which employee to view */}
          {isAdmin && (
            <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">Select Employee</label>
              <CustomSelect 
                options={[{ value: '', label: 'Select an Employee...' }, ...employees.map(e => ({ value: String(e.id), label: e.name, name: 'employee_id' }))]}
                value={filters.employee_id} 
                onChange={handleFilterChange} 
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">Select Month</label>
            <CustomSelect 
              options={months.map(m => ({ ...m, name: 'month' }))}
              value={filters.month} 
              onChange={handleFilterChange} 
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">Select Year</label>
            <CustomSelect 
              options={years.map(y => ({ ...y, name: 'year' }))}
              value={filters.year} 
              onChange={handleFilterChange} 
            />
          </div>
        </div>
      </div>

      {error && <div className="rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700 border border-red-100">{error}</div>}

      {/* EMPTY STATE (For Admins who haven't selected anyone yet) */}
      {!filters.employee_id && !isLoading && !timesheetData && isAdmin && (
        <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-12 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center">
          <div className="h-20 w-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
             <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white">Select an Employee</h3>
          <p className="text-sm font-medium text-gray-500 mt-2">Choose a technician from the filter above to view their monthly timesheet.</p>
        </div>
      )}

      {/* LOADING STATE */}
      {isLoading && (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      )}

      {/* TIMESHEET DATA DISPLAY */}
      {timesheetData && !isLoading && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          
          {/* Summary Card */}
          <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {timesheetData.employee.avatar_path ? (
                <img src={`http://localhost:8000/storage/${timesheetData.employee.avatar_path}`} alt="Avatar" className="h-16 w-16 rounded-full object-cover shadow-sm ring-4 ring-gray-50 dark:ring-gray-800" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center text-xl font-black shadow-sm ring-4 ring-gray-50 dark:ring-gray-800">
                  {timesheetData.employee.name.charAt(0)}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">{timesheetData.employee.name}</h2>
                <p className="text-sm font-bold text-gray-500">{timesheetData.employee.profession || 'Field Technician'} • Timesheet for {timesheetData.period}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-gray-50 dark:bg-gray-800/50 px-5 py-3 rounded-xl border border-gray-100 dark:border-gray-700 text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Jobs Worked</p>
                <p className="text-xl font-black text-gray-900 dark:text-white">{timesheetData.summary.total_jobs}</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 px-5 py-3 rounded-xl border border-blue-100 dark:border-blue-800/50 text-center min-w-[120px]">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-wider mb-1">Total Time</p>
                <p className="text-xl font-black text-blue-700 dark:text-blue-400">{timesheetData.summary.total_time}</p>
              </div>
            </div>
          </div>

          {/* Daily Logs Table */}
          <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {timesheetData.daily_logs.map((dayLog, index) => {
                const isZero = dayLog.total_daily_minutes === 0;

                return (
                  <div key={index} className={`p-4 sm:p-6 transition-colors ${isZero ? 'bg-gray-50/30 dark:bg-gray-900/40' : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/30'}`}>
                    
                    {/* Day Header */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                      <h4 className={`text-sm font-black px-3 py-1.5 rounded-md w-fit ${isZero ? 'text-gray-400 bg-gray-100/50 dark:bg-gray-800/40 dark:text-gray-500' : 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800'}`}>
                        {dayLog.date}
                      </h4>
                      <span className={`text-xs font-bold border px-3 py-1.5 rounded-md shadow-sm w-fit ${isZero ? 'text-gray-400 bg-transparent border-gray-200 dark:border-gray-800' : 'text-gray-500 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'}`}>
                        Daily Total: <span className={`ml-1 ${isZero ? 'text-gray-400' : 'text-blue-600 dark:text-blue-400'}`}>{formatMinutes(dayLog.total_daily_minutes)}</span>
                      </span>
                    </div>

                    {/* Day's Jobs List */}
                    <div className="space-y-3 pl-1 sm:pl-2">
                      {isZero ? (
                        <div className="text-[11px] font-bold text-gray-400 dark:text-gray-600 italic px-2 py-1">
                          No work logged for this day.
                        </div>
                      ) : (
                        dayLog.jobs.map(job => (
                          <div key={job.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-xl border border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-900 shadow-sm">
                            
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                <span className="text-gray-400 mr-1.5">#{job.id}</span>
                                {job.title}
                              </p>
                              <p className="text-[11px] font-medium text-gray-500 mt-0.5 truncate flex items-center gap-1">
                                 <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                {job.property}
                              </p>
                            </div>

                            <div className="flex items-center gap-6 shrink-0">
                              <div className="text-right">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Time Log</p>
                                <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                  {job.start_time} <span className="text-gray-400 mx-1">&rarr;</span> {job.end_time}
                                </p>
                              </div>
                              
                              <div className="text-right min-w-[80px]">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Duration</p>
                                <p className="text-sm font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded inline-block">
                                  {job.duration_formatted}
                                </p>
                              </div>
                            </div>

                          </div>
                        ))
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}