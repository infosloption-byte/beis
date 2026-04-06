import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from '../lib/axios';
import CustomSelect from '../components/CustomSelect';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [properties, setProperties] = useState([]);
  const [clients, setClients] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState('list');
  const [editingId, setEditingId] = useState(null);

  const [filters, setFilters] = useState({
    search: '', property: '', client: '', priority: '', status: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // --- ADVANCED ASSIGNMENT MODAL STATE ---
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [jobToAssign, setJobToAssign] = useState(null);
  const [selectedTechId, setSelectedTechId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  
  // Assignment Filters
  const [assignSearchQuery, setAssignSearchQuery] = useState('');
  const [assignAvailability, setAssignAvailability] = useState('all'); // 'all', 'zero_active', 'no_overlap'
  const [assignProfession, setAssignProfession] = useState('');
  const [assignSkills, setAssignSkills] = useState([]);

  const defaultFormState = {
    title: '', property_id: '', client_id: '', assigned_to: '',
    priority: 'Medium', status: 'Requested', description: '',
    start_date: '', end_date: ''
  };

  const [formData, setFormData] = useState(defaultFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newImages, setNewImages] = useState([]); 
  const [existingImages, setExistingImages] = useState([]); 
  const [deletedAttachmentIds, setDeletedAttachmentIds] = useState([]); 

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [jobsRes, propsRes, usersRes] = await Promise.all([
        axios.get('/api/jobs'), axios.get('/api/properties'), axios.get('/api/users')
      ]);
      setJobs(jobsRes.data);
      setProperties(propsRes.data);
      const allUsers = usersRes.data;
      setClients(allUsers.filter(u => u.roles?.some(r => (r.name || r).toLowerCase() === 'client')));
      setTechnicians(allUsers.filter(u => u.roles?.some(r => (r.name || r).toLowerCase() === 'employee')));
    } catch (err) {
      console.error(err);
      setError('Failed to load data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setCurrentPage(1); 
  };

  const clearFilters = () => {
    setFilters({ search: '', property: '', client: '', priority: '', status: '' });
    setCurrentPage(1);
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const searchLower = filters.search.toLowerCase();
      const matchSearch = job.title.toLowerCase().includes(searchLower) || String(job.id).includes(searchLower);
      const matchProperty = filters.property ? String(job.property_id) === String(filters.property) : true;
      const matchClient = filters.client ? String(job.client_id) === String(filters.client) : true;
      const matchPriority = filters.priority ? job.priority === filters.priority : true;
      const matchStatus = filters.status ? job.status === filters.status : true;
      return matchSearch && matchProperty && matchClient && matchPriority && matchStatus;
    });
  }, [jobs, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / rowsPerPage));
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // --- SMART ASSIGNMENT LOGIC ---
  const openAssignModal = (job) => {
    setJobToAssign(job);
    setSelectedTechId(job.assigned_to ? String(job.assigned_to) : '');
    // Reset Filters
    setAssignSearchQuery('');
    setAssignAvailability('all');
    setAssignProfession('');
    setAssignSkills([]);
    setIsAssignModalOpen(true);
  };

  const closeAssignModal = () => {
    setIsAssignModalOpen(false);
    setJobToAssign(null);
  };

  const handleAssignTechnician = async () => {
    if (!selectedTechId || !jobToAssign) return;
    setIsAssigning(true);
    try {
      const response = await axios.post(`/api/jobs/${jobToAssign.id}/assign`, { assigned_to: selectedTechId });
      setJobs(jobs.map(j => j.id === jobToAssign.id ? response.data.job : j));
      closeAssignModal();
    } catch (err) {
      alert('Failed to assign technician.');
    } finally {
      setIsAssigning(false);
    }
  };

  // Extract unique professions & skills from the tech pool
  const uniqueProfessions = useMemo(() => [...new Set(technicians.map(t => t.profession).filter(Boolean))], [technicians]);
  const uniqueSkills = useMemo(() => [...new Set(technicians.flatMap(t => t.skills || []))], [technicians]);

  const toggleAssignSkill = (skill) => {
    setAssignSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  };

  // Compute Active Jobs and Filter Technicians
  const techniciansWithStats = useMemo(() => {
    return technicians.map(tech => {
      // Find all active jobs for this tech (not completed/closed)
      const techActiveJobs = jobs.filter(j => 
        String(j.assigned_to) === String(tech.id) && 
        !['Completed', 'Closed'].includes(j.status)
      );

      // Check for overlap with the currently selected job
      let hasOverlap = false;
      if (jobToAssign?.start_date && jobToAssign?.end_date) {
        const targetStart = new Date(jobToAssign.start_date).getTime();
        const targetEnd = new Date(jobToAssign.end_date).getTime();

        hasOverlap = techActiveJobs.some(j => {
          if (!j.start_date || !j.end_date) return false;
          const s = new Date(j.start_date).getTime();
          const e = new Date(j.end_date).getTime();
          return (targetStart < e && targetEnd > s); // Time intersection formula
        });
      }

      return { ...tech, activeJobsCount: techActiveJobs.length, hasOverlap };
    });
  }, [technicians, jobs, jobToAssign]);

  const filteredTechnicians = techniciansWithStats.filter(tech => {
    // 1. Search Query
    const matchSearch = tech.name.toLowerCase().includes(assignSearchQuery.toLowerCase());
    // 2. Profession
    const matchProfession = assignProfession ? tech.profession === assignProfession : true;
    // 3. Skills (Must have ALL selected skills)
    const matchSkills = assignSkills.length === 0 || assignSkills.every(skill => (tech.skills || []).includes(skill));
    // 4. Availability
    let matchAvailability = true;
    if (assignAvailability === 'zero_active') matchAvailability = tech.activeJobsCount === 0;
    if (assignAvailability === 'no_overlap') matchAvailability = !tech.hasOverlap;

    return matchSearch && matchProfession && matchSkills && matchAvailability;
  });


  // --- FORM HANDLERS ---
  const handleEditClick = (job) => {
    setFormData({
      title: job.title || '',
      property_id: job.property_id ? String(job.property_id) : '',
      client_id: job.client_id ? String(job.client_id) : '',
      assigned_to: job.assigned_to ? String(job.assigned_to) : '',
      priority: job.priority || 'Medium',
      status: job.status || 'Requested',
      description: job.description || '',
      start_date: job.start_date ? new Date(job.start_date).toISOString().slice(0, 16) : '',
      end_date: job.end_date ? new Date(job.end_date).toISOString().slice(0, 16) : ''
    });
    setEditingId(job.id);
    setExistingImages(job.attachments || []);
    setNewImages([]);
    setDeletedAttachmentIds([]);
    setActiveTab('add');
  };

  const handleTabSwitch = (tab) => {
    if (tab === 'list' || (tab === 'add' && editingId)) {
      setFormData(defaultFormState);
      setEditingId(null);
      setNewImages([]);
      setExistingImages([]);
      setDeletedAttachmentIds([]);
      setError('');
    }
    setActiveTab(tab);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'property_id') {
        const selectedProp = properties.find(p => String(p.id) === String(value));
        if (selectedProp && selectedProp.client_id) newData.client_id = String(selectedProp.client_id);
      }
      return newData;
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) setNewImages(prev => [...prev, ...Array.from(e.target.files)]);
    e.target.value = ''; 
  };

  const removeNewImage = (index) => setNewImages(prev => prev.filter((_, i) => i !== index));
  const removeExistingImage = (attachmentId) => {
    setDeletedAttachmentIds(prev => [...prev, attachmentId]);
    setExistingImages(prev => prev.filter(img => img.id !== attachmentId));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const submitData = new FormData();
    Object.keys(formData).forEach(key => submitData.append(key, formData[key] === null ? '' : formData[key]));
    newImages.forEach(file => submitData.append('images[]', file));
    deletedAttachmentIds.forEach(id => submitData.append('deleted_attachments[]', id));

    try {
      if (editingId) {
        submitData.append('_method', 'PUT');
        await axios.post(`/api/jobs/${editingId}`, submitData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await axios.post('/api/jobs', submitData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      handleTabSwitch('list');
      await fetchData();
    } catch (err) {
      setError(`Failed to ${editingId ? 'update' : 'create'} job. Validation error.`);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low': return 'text-gray-400 dark:text-gray-500';
      case 'Medium': return 'text-blue-600 dark:text-blue-400';
      case 'High': return 'text-orange-500 dark:text-orange-400';
      case 'Emergency': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pt-2 pb-12 relative">
      {error && <div className="rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700 border border-red-100">{error}</div>}

      {/* --- ADVANCED ASSIGNMENT MODAL OVERLAY --- */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] w-full max-w-5xl p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-gray-800 slide-in-from-bottom-4 flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-start mb-6 shrink-0">
              <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Assign Technician</h3>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                  Dispatching for <span className="font-bold text-blue-600 dark:text-blue-400">#{jobToAssign?.id}: {jobToAssign?.title}</span>
                </p>
              </div>
              <button onClick={closeAssignModal} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Split Layout Container */}
            <div className="flex flex-col md:flex-row gap-6 overflow-hidden flex-1">
              
              {/* Left Sidebar: Advanced Filters */}
              <div className="w-full md:w-1/3 flex flex-col gap-5 overflow-y-auto custom-scrollbar pr-2 pb-4">
                
                {/* Search */}
                <div>
                  <div className="relative">
                    <svg className="absolute left-4 top-3 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input 
                      type="text" placeholder="Search by name..." 
                      value={assignSearchQuery} onChange={(e) => setAssignSearchQuery(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                    />
                  </div>
                </div>

                {/* Availability Radio Buttons */}
                <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-3">Availability Status</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="radio" name="availability" checked={assignAvailability === 'all'} onChange={() => setAssignAvailability('all')} className="text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors">Show All Technicians</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="radio" name="availability" checked={assignAvailability === 'zero_active'} onChange={() => setAssignAvailability('zero_active')} className="text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors">0 Active Jobs</span>
                    </label>
                    <label className={`flex items-center gap-3 ${(!jobToAssign?.start_date || !jobToAssign?.end_date) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer group'}`}>
                      <input type="radio" name="availability" checked={assignAvailability === 'no_overlap'} onChange={() => setAssignAvailability('no_overlap')} disabled={!jobToAssign?.start_date || !jobToAssign?.end_date} className="text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed" />
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors">No Schedule Conflict</span>
                    </label>
                    {(!jobToAssign?.start_date || !jobToAssign?.end_date) && (
                      <p className="text-[10px] text-orange-500 font-bold ml-6 mt-1">Job must have dates to check conflicts.</p>
                    )}
                  </div>
                </div>

                {/* Profession Dropdown */}
                {uniqueProfessions.length > 0 && (
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">Filter by Profession</label>
                    <CustomSelect 
                      options={[{ value: '', label: 'All Professions' }, ...uniqueProfessions.map(p => ({ value: p, label: p }))]}
                      value={assignProfession} onChange={(e) => setAssignProfession(e.target.value)} placeholder="Select Profession" size="sm"
                    />
                  </div>
                )}

                {/* Skills Multi-Select Pills */}
                {uniqueSkills.length > 0 && (
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">Required Skills</label>
                    <div className="flex flex-wrap gap-2">
                      {uniqueSkills.map(skill => (
                        <button
                          key={skill} type="button" onClick={() => toggleAssignSkill(skill)}
                          className={`px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-all ${
                            assignSkills.includes(skill) 
                              ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-blue-300'
                          }`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Right Side: Results List */}
              <div className="w-full md:w-2/3 flex flex-col border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-gray-50/30 dark:bg-gray-900/50">
                <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <span className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Available Personnel</span>
                  <span className="text-[11px] font-bold bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-md shadow-sm border border-gray-200 dark:border-gray-600">
                    {filteredTechnicians.length} Results
                  </span>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                  {filteredTechnicians.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-60">
                      <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                      <p className="text-sm font-bold text-gray-600 dark:text-gray-400">No technicians match your strict filters.</p>
                      <p className="text-xs text-gray-500 mt-1">Try broadening your availability or skills criteria.</p>
                    </div>
                  ) : (
                    filteredTechnicians.map(tech => (
                      <label key={tech.id} className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer border transition-all ${
                        selectedTechId === String(tech.id) 
                          ? 'bg-blue-50/50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-700 shadow-sm' 
                          : 'bg-white border-white hover:border-gray-300 dark:bg-gray-800 dark:border-gray-800 dark:hover:border-gray-600 shadow-sm'
                      }`}>
                        <div className="pt-2">
                          <input 
                            type="radio" name="technician" value={tech.id}
                            checked={selectedTechId === String(tech.id)}
                            onChange={() => setSelectedTechId(String(tech.id))}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer border-gray-300"
                          />
                        </div>
                        
                        {tech.avatar_path ? (
                          <img src={`http://localhost:8000/storage/${tech.avatar_path}`} alt="Avatar" className="h-12 w-12 rounded-full object-cover shadow-sm border border-gray-100 dark:border-gray-700 shrink-0" />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/40 dark:to-purple-800/40 flex items-center justify-center text-purple-700 dark:text-purple-400 font-bold text-lg shadow-sm border border-purple-100 dark:border-purple-800 shrink-0">
                            {tech.name.charAt(0)}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-[15px] font-bold text-gray-900 dark:text-white truncate pr-2">{tech.name}</div>
                              <div className="text-[11px] font-black text-gray-400 uppercase tracking-wider mt-0.5">{tech.profession || 'Field Technician'}</div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              {/* Active Jobs Badge */}
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                tech.activeJobsCount === 0 
                                  ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' 
                                  : tech.activeJobsCount > 3 
                                    ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                                    : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
                              }`}>
                                {tech.activeJobsCount} Active Job{tech.activeJobsCount !== 1 ? 's' : ''}
                              </span>
                              
                              {/* Schedule Conflict Warning */}
                              {tech.hasOverlap && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded border border-orange-200 dark:border-orange-800/50">
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                  Conflict
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Render matching skills lightly */}
                          {tech.skills && tech.skills.length > 0 && (
                             <div className="mt-2 flex flex-wrap gap-1">
                               {tech.skills.map((s, idx) => (
                                 <span key={idx} className={`text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 ${assignSkills.includes(s) && 'ring-1 ring-blue-400 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'}`}>
                                   {s}
                                 </span>
                               ))}
                             </div>
                          )}
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Modal Actions Footer */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 shrink-0">
              <button onClick={closeAssignModal} className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={handleAssignTechnician} disabled={!selectedTechId || isAssigning} className="px-8 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-sm transition-all hover:shadow-md">
                {isAssigning ? 'Assigning...' : 'Confirm Assignment'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- MAIN PAGE CONTENT --- */}
      <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-0 flex flex-col relative min-h-[500px]">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 border-b border-gray-100 dark:border-gray-800/60 pb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              {activeTab === 'list' ? 'Work Orders' : (editingId ? 'Edit Work Order' : 'Create Work Order')}
            </h2>
            <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
              {activeTab === 'list' ? 'Manage and track all work orders.' : 'Create a new work order and dispatch technicians.'}
            </p>
          </div>
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit shrink-0">
            <button onClick={() => handleTabSwitch('list')} className={`px-5 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${activeTab === 'list' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Work Order List</button>
            <button onClick={() => handleTabSwitch('add')} className={`px-5 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${activeTab === 'add' && !editingId ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>New Work Order</button>
          </div>
        </div>

        <div className="flex-1">
          {activeTab === 'list' && (
            <div className="flex flex-col space-y-6">
              
              <div className="bg-gray-50 dark:bg-gray-800/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">Search ID/Title</label>
                    <input type="text" name="search" value={filters.search} onChange={handleFilterChange} placeholder="e.g. #12 or Leak" className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">Property</label>
                    <CustomSelect options={[{ value: '', label: 'All Properties' }, ...properties.map(p => ({ value: String(p.id), label: p.name, name: 'property' }))]} value={filters.property} onChange={handleFilterChange} placeholder="All Properties" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">Client</label>
                    <CustomSelect options={[{ value: '', label: 'All Clients' }, ...clients.map(c => ({ value: String(c.id), label: c.name, name: 'client' }))]} value={filters.client} onChange={handleFilterChange} placeholder="All Clients" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">Priority</label>
                    <CustomSelect options={[{ value: '', label: 'All Priorities', name: 'priority' }, { value: 'Low', label: 'Low', name: 'priority' }, { value: 'Medium', label: 'Medium', name: 'priority' }, { value: 'High', label: 'High', name: 'priority' }, { value: 'Emergency', label: 'Emergency', name: 'priority' }]} value={filters.priority} onChange={handleFilterChange} placeholder="All Priorities" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">Status</label>
                    <CustomSelect options={[{ value: '', label: 'All Statuses', name: 'status' }, { value: 'Requested', label: 'Requested', name: 'status' }, { value: 'Unassigned', label: 'Unassigned', name: 'status' }, { value: 'Scheduled', label: 'Scheduled', name: 'status' }, { value: 'In-Progress', label: 'In-Progress', name: 'status' }, { value: 'On-Hold', label: 'On-Hold', name: 'status' }, { value: 'Completed', label: 'Completed', name: 'status' }, { value: 'Closed', label: 'Closed', name: 'status' }]} value={filters.status} onChange={handleFilterChange} placeholder="All Statuses" />
                  </div>
                </div>
                {Object.values(filters).some(val => val !== '') && (
                  <div className="mt-4 flex justify-end">
                    <button onClick={clearFilters} className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 px-4 py-2 rounded-xl transition-colors">Clear Filters</button>
                  </div>
                )}
              </div>

              {/* DATA TABLE */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto custom-scrollbar">
                <table className="w-full min-w-max divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr className="divide-x divide-gray-200 dark:divide-gray-700">
                      <th className="px-4 py-4 text-center text-[11px] font-black text-gray-500 uppercase tracking-wider w-12">#</th>
                      <th className="px-4 py-4 text-left text-[11px] font-black text-gray-500 uppercase tracking-wider">Reference & Details</th>
                      <th className="px-4 py-4 text-left text-[11px] font-black text-gray-500 uppercase tracking-wider">Property & Client</th>
                      <th className="px-4 py-4 text-left text-[11px] font-black text-gray-500 uppercase tracking-wider">Assignment</th>
                      <th className="px-4 py-4 text-right text-[11px] font-black text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                    {isLoading ? <tr><td colSpan="5" className="py-10 text-center font-bold text-gray-500">Loading...</td></tr> : paginatedJobs.length === 0 ? <tr><td colSpan="5" className="py-10 text-center font-bold text-gray-500">No matching jobs found.</td></tr> : (
                      paginatedJobs.map((job, index) => (
                        <tr key={job.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors group divide-x divide-gray-200 dark:divide-gray-700">
                          <td className="p-4 text-center text-sm font-bold text-gray-400">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                          
                          <td className="p-4 whitespace-nowrap">
                            <div className="flex items-start gap-4">
                              {job.attachments && job.attachments.length > 0 ? (
                                <img src={`http://localhost:8000/storage/${job.attachments[0].file_path}`} alt="Job" className="h-10 w-10 rounded-lg object-cover shadow-sm border border-gray-100 dark:border-gray-800 mt-1" />
                              ) : (
                                <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700 mt-1">
                                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                                </div>
                              )}
                              <div>
                                <Link to={`/jobs/${job.id}`} className="text-[15px] font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                  <span className="text-blue-600 dark:text-blue-400 mr-1.5">#{job.id}</span>{job.title}
                                </Link>
                                <div className="text-xs font-medium text-gray-500 truncate max-w-[250px] mt-0.5 mb-2">{job.description}</div>
                                
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${getStatusColor(job.status)}`}>
                                    {job.status}
                                  </span>
                                  <span className={`text-[10px] font-black uppercase tracking-wider ${getPriorityColor(job.priority)}`}>
                                    • {job.priority}
                                  </span>
                                </div>

                                {(job.start_date || job.end_date) && (
                                  <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-md w-fit">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {job.start_date ? new Date(job.start_date).toLocaleDateString(undefined, {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'}) : 'TBD'}
                                    <span className="mx-1">&rarr;</span>
                                    {job.end_date ? new Date(job.end_date).toLocaleDateString(undefined, {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'}) : 'TBD'}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="p-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-gray-900 dark:text-gray-200">{job.property?.name || 'Unknown'}</div>
                            <div className="text-xs font-medium text-gray-500 mt-1">{job.client?.name || 'System Admin'}</div>
                          </td>

                          <td className="p-4 whitespace-nowrap">
                            {job.technician ? (
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-700 dark:text-purple-400 font-bold text-xs">
                                  {job.technician.name.charAt(0)}
                                </div>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">{job.technician.name}</span>
                              </div>
                            ) : (
                              <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-[11px] font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400 ring-1 ring-inset ring-red-600/10">
                                Not assigned yet
                              </span>
                            )}
                          </td>

                          <td className="p-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => openAssignModal(job)} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 dark:hover:text-green-400 rounded-lg transition-all" title="Assign Technician">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" /></svg>
                              </button>
                              <button onClick={() => handleEditClick(job)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 rounded-lg transition-all" title="Edit">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              </button>
                              <Link to={`/jobs/${job.id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 rounded-lg transition-all" title="View Board">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                              </Link>
                            </div>
                          </td>

                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              {filteredJobs.length > 0 && (
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 px-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                    <span>Show</span>
                    <div className="w-20">
                      <CustomSelect options={[{ value: '10', label: '10', name: 'rows' }, { value: '15', label: '15', name: 'rows' }, { value: '20', label: '20', name: 'rows' }, { value: '25', label: '25', name: 'rows' }]} value={String(rowsPerPage)} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }} placement="top" size="sm" />
                    </div>
                    <span>entries</span>
                  </div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-700">
                    Showing <span className="font-bold text-gray-900 dark:text-white">{(currentPage - 1) * rowsPerPage + 1}</span> to <span className="font-bold text-gray-900 dark:text-white">{Math.min(currentPage * rowsPerPage, filteredJobs.length)}</span> of <span className="font-bold text-gray-900 dark:text-white">{filteredJobs.length}</span> results
                  </div>
                  <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 text-xs font-bold text-gray-600 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-40 disabled:hover:bg-transparent transition-all">Prev</button>
                    <div className="flex items-center px-1 gap-1">
                      {[...Array(totalPages)].map((_, i) => (
                        <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded-lg transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-white hover:shadow-sm'}`}>{i + 1}</button>
                      ))}
                    </div>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 text-xs font-bold text-gray-600 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-40 disabled:hover:bg-transparent transition-all">Next</button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ADD / EDIT FORM */}
          {activeTab === 'add' && (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                <div className="space-y-6">
                  <div className="bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 sm:p-8">
                     <div className="mb-6"><h3 className="text-lg font-bold text-gray-900 dark:text-white">Job Information</h3></div>
                     <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Job Title</label>
                        <input type="text" name="title" required value={formData.title} onChange={handleFormChange} className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" placeholder="e.g. HVAC Repair" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Property</label>
                          <CustomSelect options={properties.map(p => ({ value: String(p.id), label: p.name, name: 'property_id' }))} value={String(formData.property_id)} onChange={handleFormChange} placeholder="Select Property" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Client (Auto-selected)</label>
                          <CustomSelect options={clients.map(c => ({ value: String(c.id), label: c.name, name: 'client_id' }))} value={String(formData.client_id)} onChange={handleFormChange} placeholder="Select Client" />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Start Date & Time</label>
                          <input type="datetime-local" name="start_date" value={formData.start_date} onChange={handleFormChange} className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Deadline (End Date)</label>
                          <input type="datetime-local" name="end_date" value={formData.end_date} onChange={handleFormChange} className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 sm:p-8">
                     <div className="mb-6"><h3 className="text-lg font-bold text-gray-900 dark:text-white">Assignment & Status</h3></div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Assign Technician</label>
                          <CustomSelect options={[{ value: '', label: 'Unassigned', name: 'assigned_to' }, ...technicians.map(t => ({ value: String(t.id), label: t.name, name: 'assigned_to' }))]} value={String(formData.assigned_to)} onChange={handleFormChange} placeholder="Unassigned" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Priority</label>
                          <CustomSelect options={[{ value: 'Low', label: 'Low', name: 'priority' }, { value: 'Medium', label: 'Medium', name: 'priority' }, { value: 'High', label: 'High', name: 'priority' }, { value: 'Emergency', label: 'Emergency', name: 'priority' }]} value={formData.priority} onChange={handleFormChange} />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Status</label>
                          <CustomSelect options={[{ value: 'Requested', label: 'Requested', name: 'status' }, { value: 'Scheduled', label: 'Scheduled', name: 'status' }, { value: 'In-Progress', label: 'In-Progress', name: 'status' }, { value: 'Completed', label: 'Completed', name: 'status' }, { value: 'Closed', label: 'Closed', name: 'status' }]} value={formData.status} onChange={handleFormChange} placement="top" />
                        </div>
                     </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 sm:p-8 h-full">
                    <div className="mb-6"><h3 className="text-lg font-bold text-gray-900 dark:text-white">Details & Attachments</h3></div>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Issue Description</label>
                        <textarea name="description" rows="4" required value={formData.description} onChange={handleFormChange} className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" placeholder="Describe the maintenance requirement..." />
                      </div>
                      
                      <div className="mt-4">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Job Photos / Documents</label>
                        <div className="flex items-center justify-center w-full">
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-600 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                               <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                               <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Click to upload photos</p>
                            </div>
                            <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                          </label>
                        </div>

                        {(existingImages.length > 0 || newImages.length > 0) && (
                          <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {existingImages.map((img) => (
                              <div key={img.id} className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 aspect-square bg-gray-100">
                                <img src={`http://localhost:8000/storage/${img.file_path}`} alt="Job" className="w-full h-full object-cover" />
                                <button type="button" onClick={() => removeExistingImage(img.id)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                              </div>
                            ))}
                            {newImages.map((file, idx) => (
                              <div key={idx} className="relative group rounded-lg overflow-hidden border border-blue-200 dark:border-blue-900 aspect-square bg-gray-100">
                                <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover opacity-80" />
                                <span className="absolute bottom-0 inset-x-0 bg-blue-600/80 text-[9px] font-bold text-white text-center py-0.5">NEW</span>
                                <button type="button" onClick={() => removeNewImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100 dark:border-gray-800/60 mt-8">
                <button type="button" onClick={() => handleTabSwitch('list')} className="rounded-xl px-6 py-3 text-sm font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="rounded-xl bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-all hover:shadow-md">
                  {isSubmitting ? 'Saving...' : (editingId ? 'Save Changes' : 'Create Job')}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}