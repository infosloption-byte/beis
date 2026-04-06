import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from '../lib/axios';
import CustomSelect from '../components/CustomSelect';

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [clients, setClients] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState('list');
  const [editingId, setEditingId] = useState(null);

  // --- FILTER & PAGINATION STATE ---
  const [filters, setFilters] = useState({
    name: '', client: '', address: '', type: '', status: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // --- FORM STATE ---
  const defaultFormState = {
    name: '', type: 'Commercial', client_id: '', street: '', block_number: '',
    floor_room: '', city: '', state: '', postal_code: '', google_map_link: '',
    contact_person: '', contact_number: '',
  };

  const [formData, setFormData] = useState(defaultFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newImages, setNewImages] = useState([]); 
  const [existingImages, setExistingImages] = useState([]); 
  const [deletedAttachmentIds, setDeletedAttachmentIds] = useState([]); 

  useEffect(() => {
    fetchProperties();
    fetchClients();
  }, []);

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/properties');
      setProperties(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load job sites.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await axios.get('/api/users');
      const clientUsers = response.data.filter(u => {
        if (!u.roles) return false;
        return u.roles.some(role => 
          (typeof role === 'string' && role.toLowerCase() === 'client') || 
          (role.name && role.name.toLowerCase() === 'client')
        );
      });
      setClients(clientUsers.length > 0 ? clientUsers : response.data);
    } catch (err) {
      console.error("Failed to load clients", err);
    }
  };

  // --- FILTER & PAGINATION LOGIC ---
  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setCurrentPage(1); 
  };

  const clearFilters = () => {
    setFilters({ name: '', client: '', address: '', type: '', status: '' });
    setCurrentPage(1);
  };

  const filteredProperties = useMemo(() => {
    return properties.filter(prop => {
      const matchName = prop.name.toLowerCase().includes(filters.name.toLowerCase());
      const matchClient = (prop.client?.name || '').toLowerCase().includes(filters.client.toLowerCase());
      const addressString = `${prop.street || ''} ${prop.city || ''} ${prop.state || ''} ${prop.postal_code || ''}`.toLowerCase();
      const matchAddress = addressString.includes(filters.address.toLowerCase());
      const matchType = filters.type ? prop.type === filters.type : true;
      const matchStatus = filters.status ? prop.status === filters.status : true;

      return matchName && matchClient && matchAddress && matchType && matchStatus;
    });
  }, [properties, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredProperties.length / rowsPerPage));
  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * rowsPerPage, 
    currentPage * rowsPerPage
  );

  // --- STANDARD HANDLERS ---
  const togglePropertyStatus = async (property) => {
    const newStatus = property.status === 'Active' ? 'Inactive' : 'Active';
    setProperties(properties.map(p => p.id === property.id ? { ...p, status: newStatus } : p));
    try {
      await axios.put(`/api/properties/${property.id}`, { status: newStatus });
    } catch (err) {
      console.error('Failed to update status', err);
      fetchProperties();
    }
  };

  const handleEditClick = (property) => {
    setFormData({
      name: property.name || '', type: property.type || 'Commercial',
      client_id: property.client_id ? String(property.client_id) : '', 
      street: property.street || '', block_number: property.block_number || '',
      floor_room: property.floor_room || '', city: property.city || '',
      state: property.state || '', postal_code: property.postal_code || '',
      google_map_link: property.google_map_link || '', contact_person: property.contact_person || '',
      contact_number: property.contact_number || '',
    });
    setEditingId(property.id);
    setExistingImages(property.attachments || []);
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

  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    if (e.target.files) {
      setNewImages(prev => [...prev, ...Array.from(e.target.files)]);
    }
    e.target.value = null; 
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
        await axios.post(`/api/properties/${editingId}`, submitData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await axios.post('/api/properties', submitData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      handleTabSwitch('list');
      await fetchProperties();
    } catch (err) {
      console.error(err);
      setError(`Failed to ${editingId ? 'update' : 'register'} job site.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pt-2 pb-12">
      {error && <div className="rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700 border border-red-100">{error}</div>}

      <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-0 flex flex-col relative min-h-[500px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 border-b border-gray-100 dark:border-gray-800/60 pb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              {activeTab === 'list' ? 'Job Site List' : (editingId ? 'Edit Job Site' : 'Add New Job Site')}
            </h2>
            <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
              {activeTab === 'list' ? 'Manage all service locations and client assignments.' : 'Configure facility specifications and location details.'}
            </p>
          </div>
          
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit shrink-0">
            <button onClick={() => handleTabSwitch('list')} className={`px-5 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${activeTab === 'list' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Site List</button>
            <button onClick={() => handleTabSwitch('add')} className={`px-5 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${activeTab === 'add' && !editingId ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Register New Site</button>
          </div>
        </div>

        <div className="flex-1">
          {activeTab === 'list' && (
            <div className="flex flex-col space-y-6">
              
              {/* --- ADVANCED FILTER BAR --- */}
              <div className="bg-gray-50 dark:bg-gray-800/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">Search Name</label>
                    <input type="text" name="name" value={filters.name} onChange={handleFilterChange} placeholder="e.g. Downtown Plaza" className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">Search Client</label>
                    <input type="text" name="client" value={filters.client} onChange={handleFilterChange} placeholder="e.g. Acme Corp" className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">Search Address</label>
                    <input type="text" name="address" value={filters.address} onChange={handleFilterChange} placeholder="e.g. New York or 123 St" className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">Property Type</label>
                    <CustomSelect 
                      options={[
                        { value: '', label: 'All Types', name: 'type' },
                        { value: 'Apartment', label: 'Apartment', name: 'type' },
                        { value: 'Commercial', label: 'Commercial', name: 'type' },
                        { value: 'Office', label: 'Office', name: 'type' },
                        { value: 'Warehouse', label: 'Warehouse', name: 'type' },
                        { value: 'Other', label: 'Other', name: 'type' }
                      ]}
                      value={filters.type} onChange={handleFilterChange} placeholder="All Types"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">Status</label>
                    <CustomSelect 
                      options={[
                        { value: '', label: 'All Statuses', name: 'status' },
                        { value: 'Active', label: 'Active', name: 'status' },
                        { value: 'Pending', label: 'Pending', name: 'status' },
                        { value: 'Inactive', label: 'Inactive', name: 'status' }
                      ]}
                      value={filters.status} onChange={handleFilterChange} placeholder="All Statuses"
                    />
                  </div>
                </div>
                {Object.values(filters).some(val => val !== '') && (
                  <div className="mt-4 flex justify-end">
                    <button onClick={clearFilters} className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 px-4 py-2 rounded-xl transition-colors">
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>

              {/* --- MAIN DATA TABLE --- */}
              <div className="overflow-x-auto">
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr className="divide-x divide-gray-200 dark:divide-gray-700">
                        {/* New Row Number Column Header */}
                        <th className="px-4 py-4 text-center text-[11px] font-black text-gray-500 uppercase tracking-wider w-12">#</th>
                        <th className="px-4 py-4 text-left text-[11px] font-black text-gray-500 uppercase tracking-wider">Facility & Location</th>
                        <th className="px-4 py-4 text-left text-[11px] font-black text-gray-500 uppercase tracking-wider">Client & Contact</th>
                        <th className="px-4 py-4 text-center text-[11px] font-black text-gray-500 uppercase tracking-wider">Work Orders</th>
                        <th className="px-4 py-4 text-center text-[11px] font-black text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-4 text-right text-[11px] font-black text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                      {isLoading ? <tr><td colSpan="6" className="py-10 text-center font-bold text-gray-500">Loading...</td></tr> : paginatedProperties.length === 0 ? <tr><td colSpan="6" className="py-10 text-center font-bold text-gray-500">No matching job sites found.</td></tr> : (
                        paginatedProperties.map((property, index) => (
                          <tr key={property.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors group divide-x divide-gray-200 dark:divide-gray-700">
                            
                            {/* Row Number Cell */}
                            <td className="p-4 whitespace-nowrap text-center text-sm font-bold text-gray-400 dark:text-gray-500">
                              {(currentPage - 1) * rowsPerPage + index + 1}
                            </td>

                            <td className="p-4 whitespace-nowrap">
                              <div className="flex items-center gap-4">
                                {property.attachments && property.attachments.length > 0 ? (
                                  <img src={`http://localhost:8000/storage/${property.attachments[0].file_path}`} alt="Site" className="h-12 w-12 rounded-xl object-cover shadow-sm border border-gray-100 dark:border-gray-800" />
                                ) : (
                                  <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                  </div>
                                )}
                                <div>
                                  <Link to={`/properties/${property.id}`} className="text-[15px] font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                    {property.name}
                                  </Link>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                      {property.type}
                                    </span>
                                    <span className="text-xs font-medium text-gray-500">
                                      {property.street || property.address}, {property.city}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="p-4 whitespace-nowrap">
                              <div className="text-sm font-bold text-gray-900 dark:text-gray-200">
                                {property.client?.name || 'Unassigned Client'}
                              </div>
                              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mt-1">
                                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                {property.contact_person || 'N/A'} • {property.contact_number}
                              </div>
                            </td>

                            <td className="p-4 whitespace-nowrap text-center">
                              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs dark:bg-blue-900/30 dark:text-blue-400 ring-1 ring-blue-100 dark:ring-blue-800">
                                {property.jobs_count || 0}
                              </span>
                            </td>

                            <td className="p-4 whitespace-nowrap text-center">
                              <button onClick={() => togglePropertyStatus(property)} className="group flex flex-col items-center justify-center w-full">
                                <div className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${property.status === 'Active' ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${property.status === 'Active' ? 'translate-x-5' : 'translate-x-0'}`} />
                                </div>
                                <span className={`text-[10px] font-bold mt-1 ${property.status === 'Active' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>
                                  {property.status}
                                </span>
                              </button>
                            </td>

                            <td className="p-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => handleEditClick(property)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 rounded-lg transition-all" title="Edit Site">
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <Link to={`/properties/${property.id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 rounded-lg transition-all" title="View Details">
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </Link>
                              </div>
                            </td>

                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* --- PREMIUM PAGINATION CONTROLS --- */}
              {filteredProperties.length > 0 && (
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 px-2 border-t border-gray-100 dark:border-gray-800">
                  
                  {/* Rows Per Page Selector (Now uses CustomSelect) */}
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                    <span>Show</span>
                    <div className="w-24">
                      <CustomSelect 
                        options={[
                          { value: '10', label: '10', name: 'rows' },
                          { value: '15', label: '15', name: 'rows' },
                          { value: '20', label: '20', name: 'rows' },
                          { value: '25', label: '25', name: 'rows' }
                        ]}
                        value={String(rowsPerPage)} 
                        onChange={(e) => {
                          setRowsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        placement="top"
                      />
                    </div>
                    <span>entries</span>
                  </div>

                  {/* Results Count Info */}
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-700">
                    Showing <span className="font-bold text-gray-900 dark:text-white">{(currentPage - 1) * rowsPerPage + 1}</span> to <span className="font-bold text-gray-900 dark:text-white">{Math.min(currentPage * rowsPerPage, filteredProperties.length)}</span> of <span className="font-bold text-gray-900 dark:text-white">{filteredProperties.length}</span> results
                  </div>

                  {/* Pagination Buttons Container */}
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 p-1 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm font-bold text-gray-600 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:shadow-none dark:text-gray-300 dark:hover:bg-gray-700 transition-all"
                    >
                      Prev
                    </button>
                    
                    <div className="flex items-center px-1">
                      {[...Array(totalPages)].map((_, i) => (
                        <button 
                          key={i} 
                          onClick={() => setCurrentPage(i + 1)} 
                          className={`w-9 h-9 flex items-center justify-center text-sm font-bold rounded-lg transition-all ${
                            currentPage === i + 1 
                              ? 'bg-blue-600 text-white shadow-md' 
                              : 'text-gray-600 hover:bg-white hover:shadow-sm dark:text-gray-300 dark:hover:bg-gray-700'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <button 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-sm font-bold text-gray-600 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:shadow-none dark:text-gray-300 dark:hover:bg-gray-700 transition-all"
                    >
                      Next
                    </button>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* TAB 2: ADD / EDIT PROPERTY FORM */}
          {activeTab === 'add' && (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* --- LEFT COLUMN --- */}
                <div className="space-y-6">
                  {/* Card 1: General Information */}
                  <div className="bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 sm:p-8">
                     <div className="mb-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">General Information</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Basic details and client assignment.</p>
                    </div>
                     <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Job Site Name</label>
                        <input type="text" name="name" required value={formData.name} onChange={handleFormChange} className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" placeholder="e.g. Downtown Office Plaza" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Facility Type</label>
                          <CustomSelect 
                            options={[ 
                              { value: 'Apartment', label: 'Apartment Complex', name: 'type' }, 
                              { value: 'Commercial', label: 'Commercial Building', name: 'type' }, 
                              { value: 'Office', label: 'Office Space', name: 'type' },
                              { value: 'Warehouse', label: 'Warehouse', name: 'type' },
                              { value: 'Other', label: 'Other', name: 'type' }
                            ]} 
                            value={formData.type} 
                            onChange={handleFormChange}
                            placeholder="Select Type" 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Assign Client</label>
                          <CustomSelect 
                            options={clients.map(client => ({ value: String(client.id), label: client.name, name: 'client_id' }))} 
                            value={String(formData.client_id)} 
                            onChange={handleFormChange} 
                            placeholder="-- Select a Client --"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* MULTI-IMAGE & CONTACT CARD */}
                  <div className="bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 sm:p-8">
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Contact & Media</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Who to call on site and visual reference.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">On-site Contact</label>
                        <input type="text" name="contact_person" required value={formData.contact_person} onChange={handleFormChange} className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" placeholder="e.g. Jane Smith" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Contact Number</label>
                        <input type="text" name="contact_number" required value={formData.contact_number} onChange={handleFormChange} className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" placeholder="e.g. +1 (555) 019-2837" />
                      </div>
                      
                      {/* Image Upload Area */}
                      <div className="sm:col-span-2 mt-4">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Site Photos</label>
                        <div className="flex items-center justify-center w-full">
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                               <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                               <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Click to upload photos</p>
                            </div>
                            <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                          </label>
                        </div>

                        {/* Image Previews Grid */}
                        {(existingImages.length > 0 || newImages.length > 0) && (
                          <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
                            
                            {/* Render Existing Images (From DB) */}
                            {existingImages.map((img) => (
                              <div key={img.id} className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 aspect-square bg-gray-100">
                                <img src={`http://localhost:8000/storage/${img.file_path}`} alt="Site" className="w-full h-full object-cover" />
                                <button type="button" onClick={() => removeExistingImage(img.id)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                              </div>
                            ))}

                            {/* Render New Uploading Images (Local Preview) */}
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

                {/* Right Column (Address) */}
                <div className="space-y-6">
                  <div className="bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 sm:p-8 h-full">
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Address Information</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Specific location details and map routing.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Street Name</label>
                        <input type="text" name="street" value={formData.street} onChange={handleFormChange} className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all shadow-sm" placeholder="e.g. 123 Business Parkway" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Block Number</label>
                        <input type="text" name="block_number" value={formData.block_number} onChange={handleFormChange} className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all shadow-sm" placeholder="e.g. Building B" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Floor / Room</label>
                        <input type="text" name="floor_room" value={formData.floor_room} onChange={handleFormChange} className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all shadow-sm" placeholder="e.g. 3rd Floor, Suite 300" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">City</label>
                        <input type="text" name="city" required value={formData.city} onChange={handleFormChange} className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all shadow-sm" placeholder="e.g. Metropolis" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">State / Province</label>
                        <input type="text" name="state" required value={formData.state} onChange={handleFormChange} className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all shadow-sm" placeholder="e.g. New York" />
                      </div>
                      <div className="sm:col-span-2 lg:col-span-1">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Postal Code</label>
                        <input type="text" name="postal_code" value={formData.postal_code} onChange={handleFormChange} className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all shadow-sm" placeholder="e.g. 10001" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Google Maps Link</label>
                        <input type="url" name="google_map_link" value={formData.google_map_link} onChange={handleFormChange} className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all shadow-sm" placeholder="https://goo.gl/maps/..." />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100 dark:border-gray-800/60 mt-8">
                <button type="button" onClick={() => handleTabSwitch('list')} className="rounded-xl px-6 py-3 text-sm font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="rounded-xl bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-all hover:shadow-md">
                  {isSubmitting ? 'Saving...' : (editingId ? 'Save Changes' : 'Register Job Site')}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}