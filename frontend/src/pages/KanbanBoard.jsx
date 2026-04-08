import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../lib/axios';
import { useAuthStore } from '../store/authStore';

const COLUMNS = ['Requested', 'Scheduled', 'In-Progress', 'On-Hold', 'Completed', 'Closed'];

export default function KanbanBoard() {
  const { user } = useAuthStore();
  // Clients are read-only on the Kanban board
  const isClient = user?.roles?.some(r => r.name === 'Client' || r === 'Client');

  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- DRAG & DROP ANIMATION STATE ---
  const [draggedJobId, setDraggedJobId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await axios.get('/api/jobs');
      setJobs(response.data);
    } catch (err) {
      console.error('Failed to load jobs for Kanban', err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- NATIVE DRAG HANDLERS (Secured) ---
  const handleDragStart = (e, jobId) => {
    if (isClient) return; // Security block
    e.dataTransfer.setData('jobId', jobId);
    e.dataTransfer.effectAllowed = 'move';
    
    setTimeout(() => {
      setDraggedJobId(String(jobId));
    }, 0);
  };

  const handleDragEnd = () => {
    if (isClient) return;
    setDraggedJobId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e, columnId) => {
    if (isClient) return; // Security block
    e.preventDefault(); 
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDragLeave = (e) => {
    if (isClient) return;
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e, newStatus) => {
    if (isClient) return; // Security block
    e.preventDefault();
    setDragOverColumn(null);
    
    const jobId = e.dataTransfer.getData('jobId');
    if (!jobId) return;

    const jobToUpdate = jobs.find(j => String(j.id) === jobId);
    if (!jobToUpdate || jobToUpdate.status === newStatus) return;

    // Optimistic UI Update for instant feedback
    setJobs(prev => prev.map(j => String(j.id) === jobId ? { ...j, status: newStatus } : j));

    try {
      await axios.post(`/api/jobs/${jobId}/status`, { status: newStatus });
    } catch (err) {
      alert('Failed to update status on server.');
      fetchJobs(); // Revert on failure
    }
  };

  // --- COLOR HELPERS ---
  const getCardTheme = (priority) => {
    switch (priority) {
      case 'Emergency': 
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800/50';
      case 'High': 
        return 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800/50';
      case 'Medium': 
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/50';
      case 'Low':
      default: 
        return 'bg-gray-50 border-gray-200 dark:bg-gray-800/40 dark:border-gray-700';
    }
  };

  const getPriorityPill = (priority) => {
    switch (priority) {
      case 'Emergency': return 'bg-red-500 text-white';
      case 'High': return 'bg-orange-500 text-white';
      case 'Medium': return 'bg-blue-500 text-white';
      case 'Low':
      default: return 'bg-gray-500 text-white';
    }
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div></div>;

  return (
    <div className="h-[calc(100vh-160px)] w-full overflow-x-auto overflow-y-hidden custom-scrollbar flex items-stretch gap-6 pb-2 pt-2 px-2 animate-in fade-in duration-300">
      
      {COLUMNS.map(columnStatus => {
        const columnJobs = jobs.filter(j => j.status === columnStatus);
        const isDragOver = dragOverColumn === columnStatus;
        
        let headerBg = 'bg-gray-400 dark:bg-gray-500';
        let pillText = 'text-gray-700';
        
        if (columnStatus === 'In-Progress') { headerBg = 'bg-purple-600'; pillText = 'text-purple-700'; }
        if (columnStatus === 'Scheduled') { headerBg = 'bg-blue-600'; pillText = 'text-blue-700'; }
        if (columnStatus === 'On-Hold') { headerBg = 'bg-orange-400 dark:bg-orange-500'; pillText = 'text-orange-700'; }
        if (columnStatus === 'Completed') { headerBg = 'bg-emerald-500'; pillText = 'text-emerald-700'; }
        if (columnStatus === 'Closed') { headerBg = 'bg-slate-700'; pillText = 'text-slate-800'; }

        return (
          <div 
            key={columnStatus}
            onDragOver={(e) => handleDragOver(e, columnStatus)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, columnStatus)}
            className={`flex flex-col flex-shrink-0 w-80 transition-all duration-200 h-full max-h-full ${
              isDragOver 
                ? 'bg-gray-50 dark:bg-gray-800/40 rounded-xl ring-2 ring-gray-200 dark:ring-gray-800' 
                : 'bg-transparent'
            }`}
          >
            {/* Column Header */}
            <div className={`p-4 shrink-0 flex justify-between items-center mb-4 rounded-xl ${headerBg}`}>
              <h3 className={`bg-white px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider shadow-sm ${pillText}`}>
                {columnStatus}
              </h3>
              <span className="text-xs font-bold text-gray-700 bg-white h-7 w-7 flex items-center justify-center rounded-full shadow-sm">
                {columnJobs.length}
              </span>
            </div>

            {/* Column Cards */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-1 pb-4 space-y-4">
              {columnJobs.map(job => {
                const isDragging = draggedJobId === String(job.id);

                return (
                  <div
                    key={job.id}
                    draggable={!isClient} // Disable dragging for clients
                    onDragStart={(e) => handleDragStart(e, job.id)}
                    onDragEnd={handleDragEnd}
                    className={`p-4 rounded-2xl shadow-sm border transition-all duration-200 group ${getCardTheme(job.priority)} ${
                      !isClient ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
                    } ${
                      isDragging 
                        ? 'opacity-40 scale-95 border-dashed bg-transparent shadow-none' 
                        : 'hover:-translate-y-1 hover:shadow-md'
                    }`}
                  >
                    
                    {/* Priority Pill & Avatar */}
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-sm ${getPriorityPill(job.priority)}`}>
                        {job.priority}
                      </span>
                      {job.technician && (
                        <div className="h-6 w-6 rounded-full bg-white/80 dark:bg-black/30 flex items-center justify-center text-[10px] font-bold shadow-sm text-gray-700 dark:text-gray-300" title={job.technician.name}>
                          {job.technician.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    
                    {/* Title */}
                    <Link to={`/jobs/${job.id}`} className="block text-sm font-bold text-gray-900 dark:text-white mb-1 group-hover:opacity-75 transition-opacity">
                      <span className="opacity-40 mr-1">#{job.id}</span>
                      {job.title}
                    </Link>
                    
                    {/* Property */}
                    <p className="text-[11px] font-medium text-gray-600 dark:text-gray-400 truncate mb-4">
                      {job.property?.name}
                    </p>

                    {/* Date/Time Footprint */}
                    {(job.start_date || job.end_date) && (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-600 dark:text-gray-300 bg-white/50 dark:bg-black/20 p-1.5 rounded-lg border border-white/40 dark:border-white/5">
                        <svg className="w-3 h-3 shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span className="truncate">
                          {job.start_date ? new Date(job.start_date).toLocaleDateString(undefined, {month:'short', day:'numeric'}) : 'TBD'} 
                          {' - '} 
                          {job.end_date ? new Date(job.end_date).toLocaleDateString(undefined, {month:'short', day:'numeric'}) : 'TBD'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Empty Drop Zone */}
              {!isClient && columnJobs.length === 0 && (
                <div className={`h-24 rounded-2xl border-2 border-dashed flex items-center justify-center transition-colors ${
                  isDragOver ? 'border-blue-400 bg-blue-50/50 dark:border-blue-500/50 dark:bg-blue-900/20' : 'border-gray-200/50 dark:border-gray-700/50'
                }`}>
                  <span className="text-xs font-bold text-gray-400">Drop here</span>
                </div>
              )}
            </div>
            
          </div>
        );
      })}
    </div>
  );
}