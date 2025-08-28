import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Market {
  id: number;
  title: string;
  participants: string[];
  participantImages: string | null;
  status: string;
  startTime: string | null;
  endTime: string | null;
  createdAt: string;
  updatedAt: string;
  volume?: number;
  chance?: number;
}

interface EditFormData {
  title: string;
  participants: string[];
  startTime: string;
  endTime: string;
  image: File | null;
}

const EditActiveDeactivatePage: React.FC = () => {
  
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [editingMarket, setEditingMarket] = useState<Market | null>(null);
  const [editForm, setEditForm] = useState<EditFormData>({
    title: '',
    participants: ['', ''],
    startTime: '',
    endTime: '',
    image: null
  });
  const [actionLoading, setActionLoading] = useState<{ [key: number]: boolean }>({});
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageError, setImageError] = useState<string>('');

  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}api/admin/markets/market`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 200) {
        const data = response.data;
        // Add mock data for volume and chance if not present
        const marketsWithMockData = data.map((market: Market) => ({
          ...market,
          volume: market.volume || Math.floor(Math.random() * 500000) + 50000, // Random volume between 50k-550k
          chance: market.chance || Math.floor(Math.random() * 40) + 50 // Random chance between 50-90%
        }));
        setMarkets(marketsWithMockData);
      }
    } catch (error: any) {
      console.error('Error fetching markets:', error);
      setError(error.response?.data?.message || 'Failed to fetch markets');
    } finally {
      setLoading(false);
    }
  };

  const handleMarketAction = async (marketId: number, action: 'activate' | 'deactivate') => {
    setActionLoading(prev => ({ ...prev, [marketId]: true }));
    setError('');
    setSuccessMessage('');

    try {
      const endpoint = action === 'activate' ? 'activate' : 'deactivate';
      const response = await axios.patch(`${import.meta.env.VITE_API_URL}api/admin/markets/market/${marketId}/${endpoint}`, {}, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        setSuccessMessage(`Market ${action}d successfully!`);
        fetchMarkets(); // Refresh the markets list
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }
    } catch (error: any) {
      console.error(`Error ${action}ing market:`, error);
      setError(error.response?.data?.message || `Failed to ${action} market`);
      
      // Hide error message after 3 seconds
      setTimeout(() => {
        setError('');
      }, 3000);
    } finally {
      setActionLoading(prev => ({ ...prev, [marketId]: false }));
    }
  };

  const handleEditMarket = async (marketId: number) => {
    setActionLoading(prev => ({ ...prev, [marketId]: true }));
    setError('');
    setSuccessMessage('');
    setImageError('');

    try {
      const formData = new FormData();
      formData.append('title', editForm.title);
      formData.append('participants', JSON.stringify(editForm.participants));
      formData.append('startTime', editForm.startTime);
      formData.append('endTime', editForm.endTime);
      
      if (editForm.image) {
        formData.append('profileImage', editForm.image);
      }

      const response = await axios.put(`${import.meta.env.VITE_API_URL}api/admin/markets/market/${marketId}`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200) {
        setSuccessMessage('Market updated successfully!');
        closeEditForm();
        fetchMarkets();
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }
    } catch (error: any) {
      console.error('Error updating market:', error);
      setError(error.response?.data?.message || 'Failed to update market');
      
      // Hide error message after 3 seconds
      setTimeout(() => {
        setError('');
      }, 3000);
    } finally {
      setActionLoading(prev => ({ ...prev, [marketId]: false }));
    }
  };

  const openEditForm = (market: Market) => {
    setEditingMarket(market);
    setEditForm({
      title: market.title,
      participants: market.participants || ['', ''],
      startTime: market.startTime ? new Date(market.startTime).toISOString().slice(0, 16) : '',
      endTime: market.endTime ? new Date(market.endTime).toISOString().slice(0, 16) : '',
      image: null
    });
    setImagePreview(market.participantImages || '');
    setImageError('');
  };

  const closeEditForm = () => {
    setEditingMarket(null);
    setEditForm({
      title: '',
      participants: ['', ''],
      startTime: '',
      endTime: '',
      image: null
    });
    setImagePreview('');
    setImageError('');
  };

  const handleEditFormChange = (field: keyof EditFormData, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setImageError('Image size must be less than 5MB');
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setImageError('Please select a valid image file (JPG, PNG, GIF)');
        return;
      }

      setEditForm(prev => ({ ...prev, image: file }));
      setImageError('');
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setEditForm(prev => ({ ...prev, image: null }));
    setImagePreview('');
    setImageError('');
  };

  const addParticipant = () => {
    setEditForm(prev => ({
      ...prev,
      participants: [...prev.participants, '']
    }));
  };

  const removeParticipant = (index: number) => {
    if (editForm.participants.length > 2) {
      setEditForm(prev => ({
        ...prev,
        participants: prev.participants.filter((_, i) => i !== index)
      }));
    }
  };

  const updateParticipant = (index: number, value: string) => {
    setEditForm(prev => ({
      ...prev,
      participants: prev.participants.map((p, i) => i === index ? value : p)
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-green-100 text-green-800';
      case 'CLOSED': return 'bg-red-100 text-red-800';
      case 'SETTLED': return 'bg-blue-100 text-blue-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      case 'UPCOMING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getTimeRemaining = (endTime: string | null) => {
    if (!endTime) return 'N/A';
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'ENDED';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} DAY${days > 1 ? 'S' : ''}`;
    if (hours > 0) return `${hours} HOUR${hours > 1 ? 'S' : ''}`;
    return 'LESS THAN 1 HOUR';
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M ETB`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(0)}k ETB`;
    }
    return `${volume} ETB`;
  };

  const formatDateShort = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Active/Deactivate Markets</h1>
          <p className="text-gray-600 mt-1">Manage and control market status</p>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Success</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>{successMessage}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading markets...</p>
          </div>
        </div>
      ) : markets.length === 0 ? (
        <div className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Markets Found</h3>
          <p className="text-gray-500">
            There are no markets available for editing.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {markets.map((market) => (
            <div key={market.id} className="bg-white border border-yellow-400 rounded-lg p-6 shadow-sm">
              <div className="grid grid-cols-4 gap-6 items-center">
                {/* Section 1: Title and Image */}
                <div className="flex flex-col space-y-3">
                  <h3 className="text-lg font-bold text-gray-900">{market.title}</h3>
                  
                  {/* Single Rectangular Image */}
                  {market.participantImages ? (
                    <img 
                      src={market.participantImages} 
                      alt="Market image" 
                      className="w-full h-20 rounded-lg object-cover border border-gray-300"
                    />
                  ) : (
                    <div className="w-full h-20 bg-gray-200 rounded-lg border border-gray-300 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Section 2: Pie Chart */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#14b8a6"
                        strokeWidth="3"
                        strokeDasharray={`${market.chance || 60}, 100`}
                      />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Chance {market.chance || 60}%</p>
                </div>

                {/* Section 3: Info/Stats */}
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">Volume {formatVolume(market.volume || 128000)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">{formatDateShort(market.endTime)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">ENDS IN {getTimeRemaining(market.endTime)}</span>
                  </div>
                </div>

                {/* Section 4: Action Buttons */}
                <div className="flex space-x-2 justify-center">
                  <button
                    onClick={() => openEditForm(market)}
                    disabled={actionLoading[market.id]}
                    className="w-10 h-10 bg-yellow-400 text-gray-800 rounded-lg hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    title="Edit"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => handleMarketAction(market.id, 'activate')}
                    disabled={actionLoading[market.id] || market.status === 'OPEN'}
                    className="w-10 h-10 bg-yellow-400 text-gray-800 rounded-lg hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    title="Activate"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => handleMarketAction(market.id, 'deactivate')}
                    disabled={actionLoading[market.id] || market.status === 'CLOSED'}
                    className="w-10 h-10 bg-yellow-400 text-gray-800 rounded-lg hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    title="Deactivate"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-4 flex justify-end">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(market.status)}`}>
                  {market.status}
                </span>
              </div>

              {/* Edit Form Modal */}
              {editingMarket?.id === market.id && (
                <div className="fixed inset-0   bg-opacity-5 backdrop-blur-lg flex items-center justify-center z-50" onClick={closeEditForm}>
                  <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-xl font-semibold text-gray-900">Edit Market</h4>
                        <button
                          onClick={closeEditForm}
                          className="text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        {/* Title */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Market Title
                          </label>
                          <input
                            type="text"
                            value={editForm.title}
                            onChange={(e) => handleEditFormChange('title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        {/* Image Upload */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Market Image
                          </label>
                          <div className="space-y-3">
                            {/* Current Image Preview */}
                            {imagePreview && (
                              <div className="flex items-center space-x-3">
                                <img 
                                  src={imagePreview} 
                                  alt="Current market image" 
                                  className="w-20 h-20 rounded-lg object-cover border border-gray-300"
                                />
                                <button
                                  type="button"
                                  onClick={removeImage}
                                  className="px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded hover:bg-red-50"
                                >
                                  Remove Image
                                </button>
                              </div>
                            )}
                            
                            {/* File Input */}
                            <div className="flex items-center space-x-3">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                              />
                            </div>
                            
                            {/* Image Error */}
                            {imageError && (
                              <p className="text-sm text-red-600">{imageError}</p>
                            )}
                            
                            {/* Image Help Text */}
                            <p className="text-xs text-gray-500">
                              Supported formats: JPG, PNG, GIF. Maximum size: 5MB.
                            </p>
                          </div>
                        </div>

                        {/* Participants */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Participants
                          </label>
                          <div className="space-y-2">
                            {editForm.participants.map((participant, index) => (
                              <div key={index} className="flex space-x-2">
                                <input
                                  type="text"
                                  value={participant}
                                  onChange={(e) => updateParticipant(index, e.target.value)}
                                  placeholder={`Participant ${index + 1}`}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {editForm.participants.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => removeParticipant(index)}
                                    className="px-3 py-2 text-red-600 hover:text-red-800"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={addParticipant}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              + Add Participant
                            </button>
                          </div>
                        </div>

                        {/* Date and Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Start Date & Time
                            </label>
                            <input
                              type="datetime-local"
                              value={editForm.startTime}
                              onChange={(e) => handleEditFormChange('startTime', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              End Date & Time
                            </label>
                            <input
                              type="datetime-local"
                              value={editForm.endTime}
                              onChange={(e) => handleEditFormChange('endTime', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                          <button
                            onClick={closeEditForm}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleEditMarket(market.id)}
                            disabled={actionLoading[market.id]}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading[market.id] ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EditActiveDeactivatePage;
