import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../lib/axios';

export default function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await axios.get(`/api/properties/${id}`);
        setProperty(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load property details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  if (isLoading) return <div className="flex h-[50vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div></div>;
  if (error || !property) return <div className="text-center p-12 text-red-500 font-bold">{error || 'Property not found'}</div>;

  // Generate an Activity Timeline from the Jobs array
  const generateTimeline = () => {
    let events = [];
    property.jobs?.forEach(job => {
      events.push({ id: `c-${job.id}`, date: new Date(job.created_at), type: 'created', text: `Work Order #${job.id} requested: ${job.title}` });
      if (job.status === 'Completed' && job.updated_at) {
        events.push({ id: `d-${job.id}`, date: new Date(job.updated_at), type: 'completed', text: `Work Order #${job.id} was completed.` });
      }
    });
    // Sort newest first
    return events.sort((a, b) => b.date - a.date);
  };

  const timelineEvents = generateTimeline();
  const images = property?.attachments || [];
  const hasImages = images.length > 0;

  // Lightbox Handlers
  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const nextImage = (e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev + 1) % images.length); };
  const prevImage = (e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev - 1 + images.length) % images.length); };

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

          <img 
            src={`http://localhost:8000/storage/${images[lightboxIndex].file_path}`} 
            alt="Property Fullscreen" 
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl" 
            onClick={(e) => e.stopPropagation()} 
          />

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

      {/* Top Banner / Hero Card */}
      <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col md:flex-row gap-8 items-start md:items-center border border-gray-100 dark:border-gray-800/60">
        
        {/* Cover Image Thumbnail */}
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
               <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`inline-flex rounded-md px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${property.status === 'Active' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
              {property.status} SITE
            </span>
            <span className="inline-flex rounded-md bg-gray-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {property.type}
            </span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{property.name}</h1>
          <p className="text-sm font-medium text-gray-500 mt-2">
            {property.street || property.address}, {property.city}, {property.state} {property.postal_code}
          </p>
        </div>

        <div className="shrink-0 flex flex-col gap-3 w-full md:w-auto">
          {property.google_map_link && (
            <a href={property.google_map_link} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
               Open in Maps
            </a>
          )}
          <Link to="/properties" className="w-full text-center text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
            &larr; Back to Directory
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Details & Work Orders */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Info Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-gray-800/60">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Client Ownership</h3>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-lg">
                  {property.client?.name?.charAt(0) || 'C'}
                </div>
                <div>
                  <p className="text-base font-bold text-gray-900 dark:text-white">{property.client?.name || 'Unassigned'}</p>
                  <p className="text-sm font-medium text-gray-500">{property.client?.email || 'No email on file'}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-gray-800/60">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">On-Site Contact</h3>
              <div className="space-y-1">
                <p className="text-base font-bold text-gray-900 dark:text-white">{property.contact_person || 'No Contact Specified'}</p>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{property.contact_number}</p>
                {property.floor_room && <p className="text-xs font-bold text-gray-400 mt-2">Location: {property.block_number} {property.floor_room}</p>}
              </div>
            </div>
          </div>

          {/* Associated Work Orders Table */}
          <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-gray-800/60">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Associated Work Orders</h3>
              <Link to="/jobs" className="text-sm font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400">View All &rarr;</Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="py-3 text-left text-[11px] font-black text-gray-400 uppercase tracking-wider">Reference</th>
                    <th className="py-3 text-left text-[11px] font-black text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="py-3 text-left text-[11px] font-black text-gray-400 uppercase tracking-wider">Assigned Tech</th>
                    <th className="py-3 text-right text-[11px] font-black text-gray-400 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  {property.jobs?.length === 0 ? (
                    <tr><td colSpan="4" className="py-6 text-center text-sm font-medium text-gray-500">No work orders recorded for this site.</td></tr>
                  ) : (
                    property.jobs?.map(job => (
                      <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="py-3 whitespace-nowrap">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">#{job.id} - {job.title}</p>
                          <p className="text-[11px] font-bold text-gray-400">{new Date(job.created_at).toLocaleDateString()}</p>
                        </td>
                        <td className="py-3 whitespace-nowrap">
                          <span className="inline-flex rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-300">{job.status}</span>
                        </td>
                        <td className="py-3 whitespace-nowrap text-sm font-medium text-gray-600 dark:text-gray-400">
                          {job.technician?.name || 'Unassigned'}
                        </td>
                        <td className="py-3 whitespace-nowrap text-right">
                          <Link to={`/jobs/${job.id}`} className="text-sm font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400">Board &rarr;</Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: Activity Timeline */}
        <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-gray-800/60 h-fit">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Site Activity Timeline</h3>
          
          <div className="flow-root pr-2">
            <ul role="list" className="-mb-8">
              {timelineEvents.length === 0 ? (
                <p className="text-sm font-medium text-gray-500">No activity recorded yet.</p>
              ) : (
                timelineEvents.map((event, eventIdx) => (
                  <li key={event.id}>
                    <div className="relative pb-8">
                      {eventIdx !== timelineEvents.length - 1 ? (
                        <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-800" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-gray-900 ${event.type === 'created' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'}`}>
                            {event.type === 'created' ? (
                               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                            ) : (
                               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            )}
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{event.text}</p>
                          </div>
                          <div className="whitespace-nowrap text-right text-[11px] font-bold text-gray-400">
                            {event.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}