import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../lib/axios';

export default function UserDetails() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(`/api/users/${id}`);
      setUser(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load user details.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="flex h-[50vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div></div>;
  if (error || !user) return <div className="text-center p-12 text-red-500 font-bold">{error || 'User not found'}</div>;

  const role = user.roles?.[0]?.name || 'Unknown';
  const isClient = role === 'Client';

  const getRoleBadgeColor = (roleName) => {
    switch (roleName) {
      case 'Admin': return 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400';
      case 'Employee': return 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400';
      case 'Client': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pt-2 pb-12">
      
      {/* Top Banner / Hero Card */}
      <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col md:flex-row gap-8 items-center border border-gray-100 dark:border-gray-800/60">
        <div className="shrink-0">
          {user.avatar_path ? (
            <img src={`http://localhost:8000/storage/${user.avatar_path}`} alt="Avatar" className="h-32 w-32 rounded-full object-cover shadow-md border-4 border-white dark:border-gray-800" />
          ) : (
            <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center shadow-md border-4 border-white dark:border-gray-800">
               <span className="text-4xl font-black text-blue-600 dark:text-gray-400">{user.name.charAt(0)}</span>
            </div>
          )}
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
            <span className={`inline-flex rounded-lg px-3 py-1 text-[11px] font-black uppercase tracking-wider ${getRoleBadgeColor(role)}`}>
              {role}
            </span>
            <span className={`inline-flex rounded-lg px-3 py-1 text-[11px] font-black uppercase tracking-wider ${user.is_active ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'}`}>
              {user.is_active ? 'Active Account' : 'Inactive'}
            </span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{user.name}</h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>{user.email}</span>
            {user.phone && <span className="flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>{user.phone}</span>}
            <span className="flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>Joined {new Date(user.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="shrink-0">
          <Link to="/users" className="rounded-xl bg-gray-100 dark:bg-gray-800 px-6 py-3 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            &larr; Back to Directory
          </Link>
        </div>
      </div>

      {/* Dynamic Statistics Cards */}
      {user.stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 shadow-sm border border-gray-100 dark:border-gray-800/60 flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
               <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{isClient ? 'Total Jobs Requested' : 'Total Jobs Assigned'}</p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">{user.stats.total_jobs || user.stats.total_assigned || 0}</h3>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 shadow-sm border border-gray-100 dark:border-gray-800/60 flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
               <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Active Work Orders</p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">{user.stats.active_jobs || 0}</h3>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 shadow-sm border border-gray-100 dark:border-gray-800/60 flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
               <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{isClient ? 'Properties Owned' : 'Completed Jobs'}</p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">{user.stats.total_properties || user.stats.completed_jobs || 0}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Recent Jobs */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800/60">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Work Orders</h3>
              <Link to="/jobs" className="text-sm font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400">View Board &rarr;</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="py-3 text-left text-[11px] font-black text-gray-400 uppercase tracking-wider">Job Details</th>
                    <th className="py-3 text-left text-[11px] font-black text-gray-400 uppercase tracking-wider">{isClient ? 'Technician' : 'Property / Client'}</th>
                    <th className="py-3 text-left text-[11px] font-black text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="py-3 text-right text-[11px] font-black text-gray-400 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  {(!user.recent_jobs || user.recent_jobs.length === 0) ? (
                    <tr><td colSpan="4" className="py-6 text-center text-sm font-medium text-gray-500">No recent work orders found.</td></tr>
                  ) : (
                    user.recent_jobs.map(job => (
                      <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="py-3 pr-2 whitespace-nowrap">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">#{job.id} - {job.title}</p>
                          <p className="text-[11px] font-bold text-gray-400">{new Date(job.created_at).toLocaleDateString()}</p>
                        </td>
                        <td className="py-3 pr-2 whitespace-nowrap">
                          <p className="text-sm font-bold text-gray-900 dark:text-gray-300">{isClient ? (job.technician?.name || 'Unassigned') : (job.property?.name || 'Unknown')}</p>
                          {!isClient && <p className="text-xs font-medium text-gray-500">{job.client?.name}</p>}
                        </td>
                        <td className="py-3 whitespace-nowrap">
                          <span className="inline-flex rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-300">{job.status}</span>
                        </td>
                        <td className="py-3 whitespace-nowrap text-right">
                          <Link to={`/jobs/${job.id}`} className="text-sm font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400">View &rarr;</Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Context Specific Info */}
        <div className="space-y-6">
          {!isClient && (
            <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800/60 h-fit">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Professional Profile</h3>
              <div className="space-y-5">
                <div>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1">Profession / Title</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-200">{user.profession || 'Not specified'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1">Employee ID</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-200">{user.employee_number || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1">Passport / ID</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-200">{user.passport_number || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">Verified Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {(!user.skills || user.skills.length === 0) ? (
                      <span className="text-sm font-medium text-gray-500">No skills listed.</span>
                    ) : (
                      user.skills.map((skill, idx) => (
                        <span key={idx} className="inline-flex rounded-lg bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-400">
                          {skill}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {isClient && (
            <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800/60 h-fit">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Owned Properties</h3>
                <Link to="/properties" className="text-sm font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400">All &rarr;</Link>
              </div>
              <div className="space-y-4">
                {(!user.properties_data || user.properties_data.length === 0) ? (
                  <p className="text-sm font-medium text-gray-500">No registered properties.</p>
                ) : (
                  user.properties_data.map(prop => (
                    <div key={prop.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                      <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
                         <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link to={`/properties/${prop.id}`} className="text-sm font-bold text-gray-900 dark:text-white hover:text-blue-600 truncate block">{prop.name}</Link>
                        <p className="text-[11px] font-medium text-gray-500 truncate">{prop.city}, {prop.state}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}