import React, { useState, useEffect } from 'react';
import { LeadershipMessage, CreateLeadershipMessageRequest, UpdateLeadershipMessageRequest, LEADERSHIP_POSITIONS } from '../../../shared/types/leadership-messages';
import { useLeadershipMessagesAdmin } from '../../hooks/useLeadershipMessages';
import { Save, X, Upload, AlertCircle } from 'lucide-react';

interface LeadershipMessageFormProps {
  message?: LeadershipMessage | null;
  onClose: () => void;
}

const LeadershipMessageForm: React.FC<LeadershipMessageFormProps> = ({ message, onClose }) => {
  const { createMessage, updateMessage, loading } = useLeadershipMessagesAdmin();
  const [formData, setFormData] = useState({
    person_name: '',
    person_title: '',
    position: 'chairman' as keyof typeof LEADERSHIP_POSITIONS,
    message_content: '',
    photo_url: '',
    is_active: true,
    display_order: 0
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>('');

  // Initialize form data when message changes
  useEffect(() => {
    if (message) {
      setFormData({
        person_name: message.person_name || '',
        person_title: message.person_title || '',
        position: message.position as keyof typeof LEADERSHIP_POSITIONS || 'chairman',
        message_content: message.message_content || '',
        photo_url: message.photo_url || '',
        is_active: message.is_active ?? true,
        display_order: message.display_order || 0
      });
    } else {
      // Reset form for new message
      setFormData({
        person_name: '',
        person_title: '',
        position: 'chairman',
        message_content: '',
        photo_url: '',
        is_active: true,
        display_order: 0
      });
    }
    setErrors({});
    setSubmitError('');
  }, [message]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.person_name.trim()) {
      newErrors.person_name = 'Person name is required';
    }

    if (!formData.person_title.trim()) {
      newErrors.person_title = 'Person title is required';
    }

    if (!formData.message_content.trim()) {
      newErrors.message_content = 'Message content is required';
    }

    if (formData.message_content.length > 2000) {
      newErrors.message_content = 'Message content must be less than 2000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitError('');
      
      if (message) {
        // Update existing message
        const updateData: UpdateLeadershipMessageRequest = {
          ...formData
        };
        await updateMessage({ ...updateData, id: message.id });
      } else {
        // Create new message
        const createData: CreateLeadershipMessageRequest = {
          ...formData
        };
        await createMessage(createData);
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to save message:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to save message. Please try again.');
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {message ? 'Edit Leadership Message' : 'Add New Leadership Message'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Error Message */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <span className="text-red-800">{submitError}</span>
                </div>
              </div>
            )}

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Person Name *
                </label>
                <input
                  type="text"
                  value={formData.person_name}
                  onChange={(e) => handleInputChange('person_name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.person_name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter person's full name"
                />
                {errors.person_name && <p className="text-red-600 text-sm mt-1">{errors.person_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Person Title *
                </label>
                <input
                  type="text"
                  value={formData.person_title}
                  onChange={(e) => handleInputChange('person_title', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.person_title ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter person's title"
                />
                {errors.person_title && <p className="text-red-600 text-sm mt-1">{errors.person_title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position
                </label>
                <select
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.entries(LEADERSHIP_POSITIONS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => handleInputChange('display_order', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            {/* Photo URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photo URL
              </label>
              <div className="flex gap-3">
                <input
                  type="url"
                  value={formData.photo_url}
                  onChange={(e) => handleInputChange('photo_url', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/photo.jpg"
                />
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload
                </button>
              </div>
              {formData.photo_url && (
                <div className="mt-3">
                  <img 
                    src={formData.photo_url} 
                    alt="Preview" 
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Message Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message Content *
              </label>
              <textarea
                value={formData.message_content}
                onChange={(e) => handleInputChange('message_content', e.target.value)}
                rows={8}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.message_content ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter the leadership message..."
              />
              <div className="flex justify-between items-center mt-1">
                {errors.message_content && <p className="text-red-600 text-sm">{errors.message_content}</p>}
                <p className="text-gray-500 text-sm ml-auto">
                  {formData.message_content.length}/2000 characters
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => handleInputChange('is_active', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">
                Active (visible to public)
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {message ? 'Update Message' : 'Create Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadershipMessageForm;