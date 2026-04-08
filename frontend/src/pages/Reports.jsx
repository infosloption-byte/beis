import { useState, useEffect } from 'react';
import axios from '../lib/axios';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('work-orders');
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReportData(activeTab);
  }, [activeTab]);

  const fetchReportData = async (tab) => {
    setIsLoading(true);
    try {
      let endpoint = '';
      if (tab === 'general') endpoint = '/api/dashboard/general';
      if (tab === 'work-orders') endpoint = '/api/reports/work-orders';
      if (tab === 'technicians') endpoint = '/api/reports/technicians';
      if (tab === 'clients') endpoint = '/api/reports/clients-sites';
      
      const response = await axios.get(endpoint);
      setData(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderGeneralReport = () => {
    if (!data) return null;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-in fade-in duration-300">
        <div className="bg-gray-50 dark:bg-gray-800/40 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">Total System Users</p>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white leading-none">{data.total_users}</h3>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/40 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">Total Managed Properties</p>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white leading-none">{data.total_properties}</h3>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/40 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">Total Work Orders</p>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white leading-none">{data.total_jobs}</h3>
        </div>
      </div>
    );
  };

  const renderWorkOrdersReport = () => {
    if (!data) return null;
    const { total, completed, completion_rate, emergencies, this_month, growth, by_status, by_priority } = data;
    
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        
        {/* KPI Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-50 dark:bg-gray-800/40 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">Total Volume</p>
            <div className="flex items-end gap-3">
              <h3 className="text-3xl font-black text-gray-900 dark:text-white leading-none">{total}</h3>
              <span className={`text-xs font-bold mb-1 ${growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {growth >= 0 ? '↑' : '↓'} {Math.abs(growth)}% vs last month
              </span>
            </div>
          </div>
          <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl p-6 border border-blue-100 dark:border-blue-900/30">
            <p className="text-[11px] font-black text-blue-400 dark:text-blue-500 uppercase tracking-wider mb-2">This Month</p>
            <h3 className="text-3xl font-black text-blue-700 dark:text-blue-400 leading-none">{this_month}</h3>
          </div>
          <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-900/30">
            <p className="text-[11px] font-black text-emerald-500 dark:text-emerald-500 uppercase tracking-wider mb-2">Completion Rate</p>
            <div className="flex items-end gap-3">
              <h3 className="text-3xl font-black text-emerald-700 dark:text-emerald-400 leading-none">{completion_rate}%</h3>
              <span className="text-xs font-bold text-emerald-600/70 mb-1">{completed} total solved</span>
            </div>
          </div>
          <div className="bg-red-50/50 dark:bg-red-900/10 rounded-2xl p-6 border border-red-100 dark:border-red-900/30">
            <p className="text-[11px] font-black text-red-400 dark:text-red-500 uppercase tracking-wider mb-2">All-Time Emergencies</p>
            <h3 className="text-3xl font-black text-red-700 dark:text-red-400 leading-none">{emergencies}</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Breakdown */}
          <div className="bg-gray-50 dark:bg-gray-800/40 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-6">Work Orders by Status</h3>
            <div className="space-y-5">
              {Object.entries(by_status || {}).map(([status, count]) => {
                const percentage = Math.round((count / total) * 100) || 0;
                let colorClass = 'bg-gray-500';
                if (['Completed', 'Closed'].includes(status)) colorClass = 'bg-emerald-500';
                if (['In-Progress', 'Scheduled'].includes(status)) colorClass = 'bg-blue-500';
                if (status === 'On-Hold') colorClass = 'bg-orange-500';
                if (status === 'Unassigned') colorClass = 'bg-red-500';

                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm font-bold mb-1.5">
                      <span className="text-gray-700 dark:text-gray-300">{status}</span>
                      <span className="text-gray-900 dark:text-white">{count} <span className="text-gray-400 font-medium ml-1">({percentage}%)</span></span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                      <div className={`${colorClass} h-2.5 rounded-full transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Priority Breakdown Grid */}
          <div className="bg-gray-50 dark:bg-gray-800/40 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-6">Volume by Priority</h3>
            <div className="grid grid-cols-2 gap-4 h-[calc(100%-2rem)]">
              {['Low', 'Medium', 'High', 'Emergency'].map((priority) => {
                const count = (by_priority && by_priority[priority]) || 0;
                let color = 'text-gray-600 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
                if (priority === 'High') color = 'text-orange-600 bg-orange-50/50 dark:bg-orange-500/10 dark:text-orange-400 border-orange-100 dark:border-orange-900/30';
                if (priority === 'Emergency') color = 'text-red-600 bg-red-50/50 dark:bg-red-500/10 dark:text-red-400 border-red-100 dark:border-red-900/30';
                if (priority === 'Medium') color = 'text-blue-600 bg-blue-50/50 dark:bg-blue-500/10 dark:text-blue-400 border-blue-100 dark:border-blue-900/30';

                return (
                  <div key={priority} className={`p-6 rounded-2xl border ${color} flex flex-col justify-center items-center text-center shadow-sm`}>
                    <span className="text-4xl font-black">{count}</span>
                    <span className="text-[11px] font-bold uppercase tracking-wider mt-2 opacity-80">{priority}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTechniciansReport = () => {
    if (!data) return null;
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        
        {/* KPI Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-gray-50 dark:bg-gray-800/40 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">Total Field Staff</p>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white leading-none">{data.total_techs}</h3>
          </div>
          <div className="bg-purple-50/50 dark:bg-purple-900/10 rounded-2xl p-6 border border-purple-100 dark:border-purple-900/30">
            <p className="text-[11px] font-black text-purple-400 dark:text-purple-500 uppercase tracking-wider mb-2">Global Active Workload</p>
            <div className="flex items-end gap-3">
              <h3 className="text-3xl font-black text-purple-700 dark:text-purple-400 leading-none">{data.total_active_workload}</h3>
              <span className="text-xs font-bold text-purple-600/70 mb-1">Open Jobs</span>
            </div>
          </div>
          <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl p-6 border border-blue-100 dark:border-blue-900/30">
            <p className="text-[11px] font-black text-blue-400 dark:text-blue-500 uppercase tracking-wider mb-2">Avg Load per Tech</p>
            <div className="flex items-end gap-3">
              <h3 className="text-3xl font-black text-blue-700 dark:text-blue-400 leading-none">{data.avg_workload}</h3>
              <span className="text-xs font-bold text-blue-600/70 mb-1">Jobs / Person</span>
            </div>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-white dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-[11px] font-black text-gray-500 uppercase tracking-wider">Technician Identity</th>
                <th className="px-6 py-4 text-center text-[11px] font-black text-gray-500 uppercase tracking-wider">Active Workload</th>
                <th className="px-6 py-4 text-center text-[11px] font-black text-gray-500 uppercase tracking-wider">Critical (Emergencies)</th>
                <th className="px-6 py-4 text-center text-[11px] font-black text-gray-500 uppercase tracking-wider">All-Time Completed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-transparent">
              {data.technicians?.map((tech) => (
                <tr key={tech.id} className="hover:bg-white dark:hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      {tech.avatar_path ? (
                        <img src={`http://localhost:8000/storage/${tech.avatar_path}`} alt="Avatar" className="h-10 w-10 rounded-full object-cover shadow-sm border border-gray-100 dark:border-gray-700" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-700 dark:text-purple-400 font-bold text-sm border border-purple-200 dark:border-purple-800/50">{tech.name.charAt(0)}</div>
                      )}
                      <div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white">{tech.name}</div>
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">{tech.profession || 'Field Tech'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex rounded-lg px-3 py-1.5 text-xs font-bold border ${tech.active_jobs > 3 ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50' : 'bg-white text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 shadow-sm'}`}>
                      {tech.active_jobs} Active Jobs
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {tech.emergency_jobs > 0 ? (
                       <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400">
                         <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                         {tech.emergency_jobs}
                       </span>
                    ) : (
                       <span className="text-gray-400 dark:text-gray-600 font-medium">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-lg font-black text-gray-900 dark:text-white">{tech.completed_jobs}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderClientsReport = () => {
    if (!data) return null;
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        
        {/* KPI Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-gray-50 dark:bg-gray-800/40 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">Registered Clients</p>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white leading-none">{data.total_clients}</h3>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/40 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">Managed Properties</p>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white leading-none">{data.total_properties}</h3>
          </div>
          <div className="bg-red-50/50 dark:bg-red-900/10 rounded-2xl p-6 border border-red-100 dark:border-red-900/30">
            <p className="text-[11px] font-black text-red-400 dark:text-red-500 uppercase tracking-wider mb-2">Sites with Active Emergencies</p>
            <div className="flex items-center gap-3">
              <h3 className="text-3xl font-black text-red-700 dark:text-red-400 leading-none">{data.active_emergencies}</h3>
              {data.active_emergencies > 0 && <svg className="w-6 h-6 text-red-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Most Maintenance Intensive Sites */}
          <div className="lg:col-span-2 bg-gray-50 dark:bg-gray-800/40 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-6">Top Sites by Maintenance Volume</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.top_properties?.map((prop, idx) => (
                <div key={prop.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-sm font-black text-gray-400">#{idx + 1}</div>
                    <div className="min-w-0 pr-2">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{prop.name}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5 truncate">{prop.type} • {prop.city}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xl font-black text-blue-600 dark:text-blue-400">{prop.jobs_count}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Orders</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Clients & Facility Types Stack */}
          <div className="flex flex-col gap-6">
            
            {/* Top Clients */}
            <div className="bg-gray-50 dark:bg-gray-800/40 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-4">Most Active Clients</h3>
              <div className="space-y-4">
                {data.top_clients?.map((client, idx) => (
                  <div key={client.id} className="flex items-center gap-3">
                    {client.avatar_path ? (
                      <img src={`http://localhost:8000/storage/${client.avatar_path}`} alt="Avatar" className="h-10 w-10 rounded-full object-cover shadow-sm border border-gray-200 dark:border-gray-700" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-sm border border-emerald-200 dark:border-emerald-800/50">{client.name.charAt(0)}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{client.name}</p>
                      <p className="text-[11px] font-bold text-gray-400 mt-0.5">{client.client_jobs_count} Total Requests</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Facility Types */}
            <div className="bg-gray-50 dark:bg-gray-800/40 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-5">Sites by Facility Type</h3>
              <div className="space-y-4">
                {Object.entries(data.by_type || {}).map(([type, count]) => {
                  const percentage = Math.round((count / data.total_properties) * 100) || 0;
                  return (
                    <div key={type}>
                      <div className="flex justify-between text-sm font-bold mb-1.5">
                        <span className="text-gray-700 dark:text-gray-300">{type}</span>
                        <span className="text-gray-900 dark:text-white">{count} <span className="text-gray-400 font-medium ml-1">({percentage}%)</span></span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pt-2 pb-12 relative">
      <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-0 flex flex-col relative min-h-[500px]">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 border-b border-gray-100 dark:border-gray-800/60 pb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">System Statistics & Reports</h2>
            <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
              Analyze platform usage, resource allocation, and operational metrics.
            </p>
          </div>
        </div>

        {/* Sub-menu Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded-xl border border-gray-100 dark:border-gray-800 w-fit">
          <button 
            onClick={() => setActiveTab('general')} 
            className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${activeTab === 'general' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          >
            General Overview
          </button>
          <button 
            onClick={() => setActiveTab('work-orders')} 
            className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${activeTab === 'work-orders' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          >
            Work Order Analytics
          </button>
          <button 
            onClick={() => setActiveTab('technicians')} 
            className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${activeTab === 'technicians' ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          >
            Technician Performance
          </button>
          <button 
            onClick={() => setActiveTab('clients')} 
            className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${activeTab === 'clients' ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          >
            Site & Client Insights
          </button>
        </div>

        {/* Report Content Area */}
        <div className="flex-1">
          {isLoading ? (
             <div className="flex h-64 items-center justify-center">
               <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
             </div>
          ) : (
            <>
              {activeTab === 'general' && renderGeneralReport()}
              {activeTab === 'work-orders' && renderWorkOrdersReport()}
              {activeTab === 'technicians' && renderTechniciansReport()}
              {activeTab === 'clients' && renderClientsReport()}
            </>
          )}
        </div>

      </div>
    </div>
  );
}