import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/rootReducer';
import axios from 'axios';

const CreateMarketPage: React.FC = () => {
  
  // Create Market Form State
  const [createForm, setCreateForm] = useState({
    title: '',
    outcome1: '',
    outcome2: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    schedule: true
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [createError, setCreateError] = useState<string>('');

  // Get auth state from Redux
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Check authentication on component mount
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setCreateError('Please login to access admin features');
    } else {
      setCreateError('');
    }
  }, [isAuthenticated, user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setCreateError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setCreateError('Image file size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      setCreateError('');
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setCreateForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (createError) {
      setCreateError('');
    }
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!createForm.title.trim()) {
      errors.push('Market title is required');
    }
    if (!createForm.outcome1.trim()) {
      errors.push('First outcome is required');
    }
    if (!createForm.outcome2.trim()) {
      errors.push('Second outcome is required');
    }
    if (!createForm.startDate) {
      errors.push('Start date is required');
    }
    if (!createForm.startTime) {
      errors.push('Start time is required');
    }
    if (!createForm.endDate) {
      errors.push('End date is required');
    }
    if (!createForm.endTime) {
      errors.push('End time is required');
    }
    if (!selectedFile) {
      errors.push('Market image is required');
    }

    // Validate dates
    if (createForm.startDate && createForm.endDate) {
      const startDateTime = new Date(`${createForm.startDate}T${createForm.startTime}`);
      const endDateTime = new Date(`${createForm.endDate}T${createForm.endTime}`);
      
      if (startDateTime >= endDateTime) {
        errors.push('End date/time must be after start date/time');
      }
    }

    if (errors.length > 0) {
      setCreateError(errors.join(', '));
      return false;
    }
    return true;
  };

  const handleCreateMarket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setCreateLoading(true);
    setCreateError('');

    try {
      const formData = new FormData();
      formData.append('title', createForm.title);
      formData.append('contestant1', createForm.outcome1);
      formData.append('contestant2', createForm.outcome2);
      formData.append('startDate', `${createForm.startDate}T${createForm.startTime}`);
      formData.append('endDate', `${createForm.endDate}T${createForm.endTime}`);
      formData.append('calendar', createForm.schedule ? `${createForm.startDate}T${createForm.startTime}` : '');
      
      if (selectedFile) {
        formData.append('profileImage', selectedFile);
      }

      const response = await axios.post(`${import.meta.env.VITE_API_URL}api/admin/markets/create`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 201) {
        setCreateSuccess(true);
        // Reset form
        setCreateForm({
          title: '',
          outcome1: '',
          outcome2: '',
          startDate: '',
          startTime: '',
          endDate: '',
          endTime: '',
          schedule: true
        });
        setSelectedFile(null);
        setFilePreview('');
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setCreateSuccess(false);
        }, 3000);
      }
    } catch (error: any) {
      console.error('Error creating market:', error);
      setCreateError(error.response?.data?.message || 'Failed to create market. Please try again.');
    } finally {
      setCreateLoading(false);
    }
  };

  const resetForm = () => {
    setCreateForm({
      title: '',
      outcome1: '',
      outcome2: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      schedule: true
    });
    setSelectedFile(null);
    setFilePreview('');
    setCreateError('');
    setCreateSuccess(false);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-[1400px] mx-auto">
        {/* Header */}
      

        {/* Success Message */}
        {createSuccess && (
          <div className="mx-6 mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Market Created Successfully!</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Your new market has been created and is now available for betting.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {createError && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Creating Market</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{createError}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form - Two Column Layout */}
        <form onSubmit={handleCreateMarket} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column */}
            <div className="space-y-6">
              {/* Market Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">
                  Market Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={createForm.title}
                  onChange={handleCreateInputChange}
                  placeholder="Please enter"
                  className="w-full px-3 py-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400"
                  required
                />
              </div>

              {/* Market Outcome */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Market Outcome
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="outcome1"
                    value={createForm.outcome1}
                    onChange={handleCreateInputChange}
                    placeholder="Please enter"
                    className="w-full px-3 py-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400"
                    required
                  />
                  <input
                    type="text"
                    name="outcome2"
                    value={createForm.outcome2}
                    onChange={handleCreateInputChange}
                    placeholder="Please enter"
                    className="w-full px-3 py-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400"
                    required
                  />
                </div>
              </div>

              {/* Upload Market card */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Upload Market card
                </label>
                <div className="flex items-center space-x-3">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleFileChange}
                      required
                    />
                    <div className="px-4 py-2 border-2 border-blue-600 rounded-lg bg-white text-blue-600 font-medium hover:bg-blue-50 transition-colors">
                      Choose File
                    </div>
                  </label>
                  <span className="text-gray-500 text-sm">
                    {selectedFile ? selectedFile.name : "No file chosen"}
                  </span>
                </div>
                {filePreview && (
                  <div className="mt-3">
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="h-24 w-24 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Date / Time */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Date / Time
                </label>
                <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                  {/* Start Row */}
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700 min-w-[40px]">Start</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <input
                      type="date"
                      name="startDate"
                      value={createForm.startDate}
                      onChange={handleCreateInputChange}
                      className="flex-1 px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                      required
                    />
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <input
                      type="time"
                      name="startTime"
                      value={createForm.startTime}
                      onChange={handleCreateInputChange}
                      className="flex-1 px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                      required
                    />
                  </div>

                  {/* End Row */}
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700 min-w-[40px]">End</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <input
                      type="date"
                      name="endDate"
                      value={createForm.endDate}
                      onChange={handleCreateInputChange}
                      className="flex-1 px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                      required
                    />
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <input
                      type="time"
                      name="endTime"
                      value={createForm.endTime}
                      onChange={handleCreateInputChange}
                      className="flex-1 px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Create Market Button */}
              <button
                type="submit"
                disabled={createLoading}
                className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  'Create Market'
                )}
              </button>

              {/* Schedule Checkbox */}
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <input
                  id="schedule"
                  name="schedule"
                  type="checkbox"
                  checked={createForm.schedule}
                  onChange={handleCreateInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="schedule" className="text-sm font-medium text-gray-700">
                  schedule
                </label>
              </div>
            </div>
          </div>

          {/* Reset Button - Below the form */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Reset Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMarketPage;
