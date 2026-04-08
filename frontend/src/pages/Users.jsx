import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from '../lib/axios';
import CustomSelect from '../components/CustomSelect';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState('list');
  const [editingId, setEditingId] = useState(null);

  // --- EXPANDED FILTER STATE ---

  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState({ 
    search: '', 
    role: searchParams.get('role') || '', 
    status: '', 
    profession: '',
    availability: searchParams.get('availability') || '' // 'air' or 'fill'
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // --- MODALS STATE ---
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [userForPassword, setUserForPassword] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // --- FORM STATE ---
  const defaultFormState = {
    name: '', email: '', password: '', phone: '', role: 'Employee',
    employee_number: '', passport_number: '', profession: '', skills: ''
  };

  const [formData, setFormData] = useState(defaultFormState);
  const [avatarFile, setAvatarFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (err) {
      setError('Failed to load users.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- ADVANCED FILTER LOGIC ---
  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setCurrentPage(1); 
  };

  const clearFilters = () => {
    setFilters({ search: '', role: '', status: '', profession: '' });
    setCurrentPage(1);
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const searchLower = filters.search.toLowerCase();
      const matchSearch = 
        (user.name?.toLowerCase().includes(searchLower)) || 
        (user.email?.toLowerCase().includes(searchLower)) ||
        (user.employee_number?.toLowerCase().includes(searchLower)) ||
        (user.phone?.toLowerCase().includes(searchLower));
        
      const userRole = user.roles?.[0]?.name || '';
      const matchRole = filters.role ? userRole === filters.role : true;
      
      let matchStatus = true;
      if (filters.status === 'Active') matchStatus = user.is_active === 1 || user.is_active === true;
      if (filters.status === 'Inactive') matchStatus = user.is_active === 0 || user.is_active === false;

      const matchProfession = filters.profession 
        ? user.profession?.toLowerCase().includes(filters.profession.toLowerCase()) 
        : true;

      // --- ADDED AVAILABILITY FILTER ---
      let matchAvailability = true;
      if (filters.availability === 'air') matchAvailability = user.active_jobs === 0;
      if (filters.availability === 'fill') matchAvailability = user.active_jobs > 0;

      return matchSearch && matchRole && matchStatus && matchProfession && matchAvailability;
    });
  }, [users, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage));
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // --- ACTIONS LOGIC ---
  const toggleUserStatus = async (user) => {
    const newStatus = !user.is_active;
    setUsers(users.map(u => u.id === user.id ? { ...u, is_active: newStatus } : u));
    try {
      await axios.put(`/api/users/${user.id}`, { is_active: newStatus });
    } catch (err) {
      console.error('Failed to update status', err);
      fetchUsers(); // Revert on failure
    }
  };

  const handlePasswordResetSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) return alert("Password must be at least 8 characters.");
    try {
      await axios.put(`/api/users/${userForPassword.id}`, { password: newPassword });
      setPasswordModalOpen(false);
      setNewPassword('');
      setUserForPassword(null);
      alert('Password reset successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to reset password.');
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      await axios.delete(`/api/users/${userToDelete.id}`);
      setDeleteModalOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Failed to delete user.');
    }
  };

  // --- FORM LOGIC ---
  const handleEditClick = (user) => {
    setFormData({
      name: user.name || '', email: user.email || '', password: '', 
      phone: user.phone || '', role: user.roles?.[0]?.name || 'Employee',
      employee_number: user.employee_number || '', passport_number: user.passport_number || '',
      profession: user.profession || '', skills: user.skills ? user.skills.join(', ') : ''
    });
    setEditingId(user.id);
    setAvatarFile(null);
    setActiveTab('add');
  };

  const handleTabSwitch = (tab) => {
    if (tab === 'list' || (tab === 'add' && editingId)) {
      setFormData(defaultFormState);
      setEditingId(null);
      setAvatarFile(null);
      setError('');
    }
    setActiveTab(tab);
  };

  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) setAvatarFile(e.target.files[0]);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      if (editingId && key === 'password' && !formData[key]) return;
      submitData.append(key, formData[key] === null ? '' : formData[key]);
    });
    if (avatarFile) submitData.append('avatar', avatarFile);

    try {
      if (editingId) {
        submitData.append('_method', 'PUT');
        await axios.post(`/api/users/${editingId}`, submitData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await axios.post('/api/users', submitData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      handleTabSwitch('list');
      await fetchUsers();
    } catch (err) {
      if (err.response?.status === 422) setError(Object.values(err.response.data.errors).flat().join(' '));
      else setError(`Failed to ${editingId ? 'update' : 'create'} user.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadgeColor = (roleName) => {
    switch (roleName) {
      case 'Admin': return 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400';
      case 'Employee': return 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400';
      case 'Client': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pt-2 pb-12 relative">
      {error && <div className="rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700 border border-red-100">{error}</div>}

      {/* --- PASSWORD RESET MODAL --- */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <form onSubmit={handlePasswordResetSubmit} className="bg-white dark:bg-gray-900 rounded-[1.5rem] w-full max-w-md p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-gray-800 slide-in-from-bottom-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Reset Password</h3>
                <p className="text-sm font-medium text-gray-500">For {userForPassword?.name}</p>
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">New Password (Min 8 characters)</label>
              <input type="password" required minLength="8" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" placeholder="••••••••" />
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => {setPasswordModalOpen(false); setNewPassword('');}} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-xl transition-colors">Cancel</button>
              <button type="submit" className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all">Force Reset</button>
            </div>
          </form>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] w-full max-w-sm p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-gray-800 slide-in-from-bottom-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete User Account</h3>
            <p className="text-sm font-medium text-gray-500 mb-8">Are you sure you want to permanently delete <strong>{userToDelete?.name}</strong>? This action cannot be undone.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setDeleteModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-xl transition-colors">Cancel</button>
              <button onClick={handleDeleteSubmit} className="px-6 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-all">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MAIN PAGE --- */}
      <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-0 flex flex-col relative min-h-[500px]">
        
        {/* Header & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 border-b border-gray-100 dark:border-gray-800/60 pb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              {activeTab === 'list' ? 'Client & Users List' : (editingId ? 'Edit User Profile' : 'Onboard New Client or User')}
            </h2>
            <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
              {activeTab === 'list' ? 'Manage clients & users system access.' : 'Configure credentials and professional details.'}
            </p>
          </div>
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit shrink-0">
            <button onClick={() => handleTabSwitch('list')} className={`px-5 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${activeTab === 'list' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Client & User List</button>
            <button onClick={() => handleTabSwitch('add')} className={`px-5 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${activeTab === 'add' && !editingId ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Add Client & User</button>
          </div>
        </div>

        <div className="flex-1">
          {activeTab === 'list' && (
            <div className="flex flex-col space-y-6">
              
              {/* EXPANDED FILTER BAR */}
              <div className="bg-gray-50 dark:bg-gray-800/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">Search User</label>
                    <input 
                      type="text" name="search" value={filters.search} onChange={handleFilterChange} 
                      placeholder="Name, Email, Phone, Emp #..." 
                      className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">System Role</label>
                    <CustomSelect 
                      options={[
                        { value: '', label: 'All Roles', name: 'role' },
                        { value: 'Admin', label: 'Admin', name: 'role' },
                        { value: 'Employee', label: 'Employee', name: 'role' },
                        { value: 'Client', label: 'Client', name: 'role' }
                      ]}
                      value={filters.role} onChange={handleFilterChange} placeholder="All Roles"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">Account Status</label>
                    <CustomSelect 
                      options={[
                        { value: '', label: 'All Statuses', name: 'status' },
                        { value: 'Active', label: 'Active', name: 'status' },
                        { value: 'Inactive', label: 'Inactive', name: 'status' }
                      ]}
                      value={filters.status} onChange={handleFilterChange} placeholder="All Statuses"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">Profession</label>
                    <input 
                      type="text" name="profession" value={filters.profession} onChange={handleFilterChange} 
                      placeholder="e.g. Technician, Plumber..." 
                      className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" 
                    />
                  </div>
                </div>
                {/* Clear Filters Button Row */}
                {Object.values(filters).some(val => val !== '') && (
                  <div className="mt-4 flex justify-end">
                    <button onClick={clearFilters} className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 px-4 py-2.5 rounded-xl transition-colors w-full sm:w-auto shadow-sm">
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>

              {/* DATA TABLE */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto custom-scrollbar">
                <table className="w-full min-w-max divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr className="divide-x divide-gray-200 dark:divide-gray-700">
                      <th className="px-4 py-4 text-center text-[11px] font-black text-gray-500 uppercase tracking-wider w-12">#</th>
                      <th className="px-4 py-4 text-left text-[11px] font-black text-gray-500 uppercase tracking-wider">Identity & Contact</th>
                      <th className="px-4 py-4 text-left text-[11px] font-black text-gray-500 uppercase tracking-wider">System Role</th>
                      <th className="px-4 py-4 text-left text-[11px] font-black text-gray-500 uppercase tracking-wider">Professional Info</th>
                      <th className="px-4 py-4 text-center text-[11px] font-black text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-4 text-right text-[11px] font-black text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                    {isLoading ? <tr><td colSpan="6" className="py-10 text-center font-bold text-gray-500">Loading...</td></tr> : paginatedUsers.length === 0 ? <tr><td colSpan="6" className="py-10 text-center font-bold text-gray-500">No matching users found.</td></tr> : (
                      paginatedUsers.map((user, index) => (
                        <tr key={user.id} className={`hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors group divide-x divide-gray-200 dark:divide-gray-700 ${!user.is_active && 'opacity-60 grayscale-[50%]'}`}>
                          <td className="p-4 text-center text-sm font-bold text-gray-400">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                          
                          <td className="p-4 whitespace-nowrap">
                            <div className="flex items-center gap-4">
                              {user.avatar_path ? (
                                <img src={`http://localhost:8000/storage/${user.avatar_path}`} alt="Avatar" className="h-10 w-10 rounded-full object-cover shadow-sm border border-gray-100 dark:border-gray-800" />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold text-sm border border-gray-200 dark:border-gray-700">
                                  {user.name.charAt(0)}
                                </div>
                              )}
                              <div>
                                <Link to={`/users/${user.id}`} className="text-[14px] font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors block">
                                  {user.name}
                                </Link>
                                <div className="text-xs font-medium text-gray-500 mt-0.5">{user.email}</div>
                                {user.phone && <div className="text-xs font-medium text-gray-400 mt-0.5">{user.phone}</div>}
                              </div>
                            </div>
                          </td>

                          <td className="p-4 whitespace-nowrap">
                            {user.roles && user.roles.length > 0 ? (
                              <span className={`inline-flex rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${getRoleBadgeColor(user.roles[0].name)}`}>
                                {user.roles[0].name}
                              </span>
                            ) : (
                              <span className="text-xs font-medium text-gray-400">No Role</span>
                            )}
                          </td>

                          <td className="p-4 whitespace-nowrap">
                            {user.employee_number ? (
                              <div>
                                <div className="text-sm font-bold text-gray-700 dark:text-gray-300">{user.profession || 'Staff'}</div>
                                <div className="text-xs font-medium text-gray-500 mt-0.5">ID: {user.employee_number}</div>
                              </div>
                            ) : (
                              <span className="text-xs italic text-gray-400">N/A</span>
                            )}
                          </td>

                          <td className="p-4 whitespace-nowrap text-center">
                            <button onClick={() => toggleUserStatus(user)} className="group flex flex-col items-center justify-center w-full">
                              <div className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${user.is_active ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${user.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
                              </div>
                              <span className={`text-[10px] font-bold mt-1 ${user.is_active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>
                                {user.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </button>
                          </td>

                          <td className="p-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* View Details */}
                              <Link to={`/users/${user.id}`} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 dark:hover:text-green-400 rounded-lg transition-all" title="View Profile">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                              </Link>
                              
                              {/* Reset Password */}
                              <button onClick={() => {setUserForPassword(user); setPasswordModalOpen(true);}} className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 dark:hover:text-orange-400 rounded-lg transition-all" title="Reset Password">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                              </button>

                              {/* Edit User */}
                              <button onClick={() => handleEditClick(user)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 rounded-lg transition-all" title="Edit User">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              </button>

                              {/* Delete User */}
                              <button onClick={() => {setUserToDelete(user); setDeleteModalOpen(true);}} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-lg transition-all" title="Delete User">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          </td>

                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              {filteredUsers.length > 0 && (
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 px-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                    <span>Show</span>
                    <div className="w-20">
                      <CustomSelect 
                        options={[{ value: '10', label: '10', name: 'rows' }, { value: '15', label: '15', name: 'rows' }, { value: '20', label: '20', name: 'rows' }, { value: '25', label: '25', name: 'rows' }]}
                        value={String(rowsPerPage)} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }} placement="top" size="sm"
                      />
                    </div>
                    <span>entries</span>
                  </div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-700">
                    Showing <span className="font-bold text-gray-900 dark:text-white">{(currentPage - 1) * rowsPerPage + 1}</span> to <span className="font-bold text-gray-900 dark:text-white">{Math.min(currentPage * rowsPerPage, filteredUsers.length)}</span> of <span className="font-bold text-gray-900 dark:text-white">{filteredUsers.length}</span> results
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
                
                {/* Left Column: Account Identity (Merged) */}
                <div className="space-y-6">
                  <div className="bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 sm:p-8">
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Account Identity</h3>
                    </div>
                    <div className="space-y-5">
                      
                      {/* Merged Avatar Upload */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Profile Avatar</label>
                        <div className="flex items-center gap-4">
                          {avatarFile ? (
                            <img src={URL.createObjectURL(avatarFile)} alt="Preview" className="h-16 w-16 rounded-full object-cover border border-blue-200" />
                          ) : formData.avatar_path ? (
                            <img src={`http://localhost:8000/storage/${formData.avatar_path}`} alt="Avatar" className="h-16 w-16 rounded-full object-cover border border-gray-200" />
                          ) : (
                            <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-600">
                              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            </div>
                          )}
                          <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400 cursor-pointer transition-colors" />
                        </div>
                      </div>

                      {/* Name */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                        <input type="text" name="name" required value={formData.name} onChange={handleFormChange} className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" placeholder="e.g. John Doe" />
                      </div>

                      {/* Email and Phone */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                          <input type="email" name="email" required value={formData.email} onChange={handleFormChange} className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" placeholder="john@example.com" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                          <input type="text" name="phone" required value={formData.phone} onChange={handleFormChange} className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" placeholder="+1 (555) 000-0000" />
                        </div>
                      </div>
                      
                      {/* Role and Password */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">System Role</label>
                          <CustomSelect 
                            options={[ 
                              { value: 'Admin', label: 'Administrator', name: 'role' }, 
                              { value: 'Employee', label: 'Staff / Technician', name: 'role' }, 
                              { value: 'Client', label: 'Property Owner (Client)', name: 'role' }
                            ]} 
                            value={formData.role} 
                            onChange={handleFormChange} 
                            placement="top"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Password {editingId && <span className="text-[11px] text-gray-400 font-bold uppercase ml-1">(Leave blank to keep)</span>}</label>
                          <input type="password" name="password" required={!editingId} minLength="8" value={formData.password} onChange={handleFormChange} className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" placeholder="••••••••" />
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Right Column: Professional Details (Conditionally Rendered) */}
                <div className="space-y-6">
                  {(formData.role === 'Admin' || formData.role === 'Employee') && (
                    <div className="bg-blue-50/30 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-2 h-full">
                      <div className="mb-6">
                        <h3 className="text-lg font-bold text-blue-900 dark:text-blue-400">Professional Details</h3>
                        <p className="text-sm text-blue-600/70 dark:text-blue-400/70">Required for Staff and Admin accounts.</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Employee Number</label>
                          <input type="text" name="employee_number" value={formData.employee_number} onChange={handleFormChange} className="block w-full rounded-xl border border-white dark:border-gray-800 px-4 py-3 text-sm bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" placeholder="e.g. EMP-1042" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Passport / ID Number</label>
                          <input type="text" name="passport_number" value={formData.passport_number} onChange={handleFormChange} className="block w-full rounded-xl border border-white dark:border-gray-800 px-4 py-3 text-sm bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" placeholder="e.g. P1234567" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Profession / Job Title</label>
                          <input type="text" name="profession" value={formData.profession} onChange={handleFormChange} className="block w-full rounded-xl border border-white dark:border-gray-800 px-4 py-3 text-sm bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" placeholder="e.g. Lead HVAC Technician" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Skills (Comma separated)</label>
                          <input type="text" name="skills" value={formData.skills} onChange={handleFormChange} className="block w-full rounded-xl border border-white dark:border-gray-800 px-4 py-3 text-sm bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" placeholder="e.g. Plumbing, Electrical, Welding" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100 dark:border-gray-800/60 mt-8">
                <button type="button" onClick={() => handleTabSwitch('list')} className="rounded-xl px-6 py-3 text-sm font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="rounded-xl bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-all hover:shadow-md">
                  {isSubmitting ? 'Saving...' : (editingId ? 'Save Changes' : 'Create User')}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}