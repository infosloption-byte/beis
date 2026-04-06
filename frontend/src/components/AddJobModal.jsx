import { useState, useEffect } from 'react';
import axios from '../lib/axios';

export default function AddJobModal({ isOpen, onClose, onSuccess }) {
  const [properties, setProperties] = useState([]);
  const [formData, setFormData] = useState({
    property_id: '',
    title: '',
    description: '',
    priority: 'Medium',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch properties so the user can select one from the dropdown
  useEffect(() => {
    if (isOpen) {
      axios.get('/api/properties')
        .then(res => {
          setProperties(res.data);
          if (res.data.length > 0) {
            setFormData(prev => ({ ...prev, property_id: res.data[0].id }));
          }
        })
        .catch(err => console.error("Failed to fetch properties for dropdown", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await axios.post('/api/jobs', formData);
      setFormData({ property_id: properties[0]?.id || '', title: '', description: '', priority: 'Medium' });
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to create job. Please ensure all fields are filled.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 p-4 sm:p-0 transition-opacity">
      <div className="relative w-full max-w-lg transform rounded-xl bg-white p-6 text-left shadow-xl transition-all dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Job</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Facility / Property</label>
            <select name="property_id" required value={formData.property_id} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm">
              <option value="" disabled>Select a property...</option>
              {properties.map(prop => (
                <option key={prop.id} value={prop.id}>{prop.name} ({prop.address})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Job Title</label>
            <input type="text" name="title" required value={formData.title} onChange={handleChange} placeholder="e.g. AC Unit Leaking" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
            <select name="priority" value={formData.priority} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm">
              <option value="Low">Low (Routine)</option>
              <option value="Medium">Medium (Standard)</option>
              <option value="High">High (Urgent)</option>
              <option value="Emergency">Emergency (Immediate)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description / Details</label>
            <textarea name="description" required rows="3" value={formData.description} onChange={handleChange} placeholder="Describe the issue in detail..." className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm"></textarea>
          </div>

          <div className="mt-6 flex justify-end space-x-3 border-t border-gray-200 pt-4 dark:border-gray-800">
            <button type="button" onClick={onClose} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Cancel</button>
            <button type="submit" disabled={isLoading || properties.length === 0} className="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none disabled:opacity-50">
              {isLoading ? 'Submitting...' : 'Submit Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}