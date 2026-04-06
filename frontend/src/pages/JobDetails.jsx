import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../lib/axios';
import CustomSelect from '../components/CustomSelect';

export default function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [newStatus, setNewStatus] = useState('');
  const [updateNote, setUpdateNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => { fetchJobDetails(); }, [id]);

  const fetchJobDetails = async () => {
    try {
      const response = await axios.get(`/api/jobs/${id}`);
      setJob(response.data);
      setNewStatus(response.data.status);
    } catch (err) {
      console.error(err);
      setError('Failed to load job details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (newStatus === job.status && !updateNote) return; 
    
    setIsUpdating(true);
    try {
      const response = await axios.post(`/api/jobs/${id}/status`, {
        status: newStatus, note: updateNote
      });
      setJob(response.data.job);
      setUpdateNote(''); 
    } catch (err) {
      alert('Failed to update status.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) return <div className="flex h-[50vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div></div>;
  if (error || !job) return <div className="text-center p-12 text-red-500 font-bold">{error || 'Job not found'}</div>;

  const images = job?.attachments || [];
  const hasImages = images.length > 0;

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const nextImage = (e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev + 1) % images.length); };
  const prevImage = (e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev - 1 + images.length) % images.length); };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Requested': return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300';
      case 'Unassigned': return 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      case 'Scheduled': return 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'In-Progress': return 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
      case 'On-Hold': return 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
      case 'Completed': return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'Closed': return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pt-2 pb-12 relative">
      
      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm" onClick={closeLightbox}>
          <button className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors" onClick={closeLightbox}>
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          {images.length > 1 && (
            <button className="absolute left-6 text-white hover:text-gray-300 p-4 transition-transform hover:-translate-x-1" onClick={prevImage}>
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
          )}
          <img src={`http://localhost:8000/storage/${images[lightboxIndex].file_path}`} alt="Job Fullscreen" className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
          {images.length > 1 && (
            <button className="absolute right-6 text-white hover:text-gray-300 p-4 transition-transform hover:translate-x-1" onClick={nextImage}>
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          )}
          <div className="absolute bottom-6 text-white font-bold tracking-widest text-sm bg-black/50 px-4 py-1.5 rounded-full">
             {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}

      {/* Hero Card */}
      <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col md:flex-row gap-8 items-start md:items-center border border-gray-100 dark:border-gray-800/60">
        
        <div className="shrink-0 cursor-pointer" onClick={() => hasImages && openLightbox(0)}>
          {hasImages ? (
            <div className="relative group overflow-hidden rounded-2xl">
               <img src={`http://localhost:8000/storage/${images[0].file_path}`} alt="Cover" className="h-32 w-48 object-cover shadow-sm border border-gray-100 dark:border-gray-800 transition-transform duration-500 group-hover:scale-105" />
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-sm">
                 <svg className="w-6 h-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                 View All ({images.length})
               </div>
            </div>
          ) : (
            <div className="h-32 w-48 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 border border-gray-100 dark:border-gray-700">
               <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`inline-flex rounded-md px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${getStatusColor(job.status)}`}>
              {job.status}
            </span>
            <span className="inline-flex rounded-md bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider">
              PRIORITY: {job.priority}
            </span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">#{job.id}: {job.title}</h1>
          <p className="text-sm font-medium text-gray-500 mt-2 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {job.property?.name} • {job.property?.city}
          </p>
        </div>

        <div className="shrink-0 flex flex-col gap-3 w-full md:w-auto">
          <Link to="/jobs" className="w-full text-center text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
            &larr; Back to Board
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-gray-800/60">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Assignment</h3>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-700 dark:text-purple-400 font-bold text-lg">
                  {job.technician?.name?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="text-base font-bold text-gray-900 dark:text-white">{job.technician?.name || 'Unassigned'}</p>
                  <p className="text-sm font-medium text-gray-500">Field Technician</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-gray-800/60">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Request Origin</h3>
              <div className="space-y-1">
                <p className="text-base font-bold text-gray-900 dark:text-white">{job.client?.name || 'System Admin'}</p>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{job.client?.email || 'N/A'}</p>
                <p className="text-xs font-bold text-gray-400 mt-2">Logged: {new Date(job.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* --- NEW SCHEDULE CARD --- */}
          <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-gray-800/60 flex flex-col sm:flex-row gap-6 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-gray-800">
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Scheduled Start</h3>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">
                  {job.start_date ? new Date(job.start_date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'Not Scheduled'}
                </div>
              </div>
            </div>
            <div className="flex-1 sm:pl-6 pt-6 sm:pt-0">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Deadline</h3>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">
                  {job.end_date ? new Date(job.end_date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'No Deadline'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-gray-800/60">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Issue Description</h3>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {job.description}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-gray-800/60">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Log Progress Update</h3>
            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Update Status To:</label>
                  <CustomSelect 
                    options={[
                      { value: 'Requested', label: 'Requested' }, { value: 'Scheduled', label: 'Scheduled' }, 
                      { value: 'In-Progress', label: 'In-Progress' }, { value: 'On-Hold', label: 'On-Hold' }, 
                      { value: 'Completed', label: 'Completed' }, { value: 'Closed', label: 'Closed' }
                    ]}
                    value={newStatus} onChange={(e) => setNewStatus(e.target.value)} placement="top"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Service Note (Required for logs)</label>
                  <textarea 
                    rows="2" required value={updateNote} onChange={(e) => setUpdateNote(e.target.value)}
                    placeholder="Describe parts ordered, work completed, or delays..."
                    className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  ></textarea>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" disabled={isUpdating} className="rounded-xl bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-all hover:shadow-md">
                  {isUpdating ? 'Logging...' : 'Submit Update'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Timeline */}
        <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-gray-800/60 h-fit">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Service Timeline</h3>
          
          <div className="flow-root pr-2">
            <ul role="list" className="-mb-8">
              {job.timeline?.map((event, eventIdx) => (
                <li key={event.id}>
                  <div className="relative pb-8">
                    {eventIdx !== job.timeline.length - 1 ? (
                      <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-800" aria-hidden="true" />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-gray-900 ${event.action_type === 'created' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'}`}>
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{event.description}</p>
                          <p className="mt-0.5 text-[11px] font-bold text-gray-400">By {event.user?.name || 'System'}</p>
                        </div>
                        <div className="whitespace-nowrap text-right text-[11px] font-bold text-gray-400">
                          {new Date(event.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}