import React, { useState, useEffect, useCallback } from 'react';
import { LeadershipMessage } from '../../../shared/types/leadership-messages';
import { useLeadershipMessagesAdmin } from '../../hooks/useLeadershipMessages';
import { Plus, Edit, Trash2, Eye, Search, Filter, MessageSquare, AlertCircle, User } from 'lucide-react';
import { LEADERSHIP_POSITIONS } from '../../../shared/types/leadership-messages';

interface LeadershipMessagesManagerProps {
  onAddMessage: () => void;
  onEditMessage: (message: LeadershipMessage) => void;
  onViewMessage: (message: LeadershipMessage) => void;
}

const LeadershipMessagesManager: React.FC<LeadershipMessagesManagerProps> = ({ 
  onAddMessage, 
  onEditMessage, 
  onViewMessage 
}) => {
  const { loading, error, deleteMessage, getAllMessages } = useLeadershipMessagesAdmin();
  const [messages, setMessages] = useState<LeadershipMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPosition, setFilterPosition] = useState<string>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Load messages on component mount
  const loadMessages = useCallback(async () => {
    const allMessages = await getAllMessages();
    setMessages(allMessages);
  }, [getAllMessages]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Filter and search messages with null safety
  const filteredMessages = (messages || []).filter(message => {
    const matchesSearch = message.person_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.person_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.message_content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterPosition === 'all' || message.position === filterPosition;
    return matchesSearch && matchesFilter;
  });

  const handleViewMessage = (message: LeadershipMessage) => {
    onViewMessage(message);
  };

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    if (deleteConfirm === messageId) {
      try {
        const success = await deleteMessage(messageId);
        if (success) {
          // Refresh the messages list after successful deletion
          await loadMessages();
        }
        setDeleteConfirm(null);
      } catch (error) {
        console.error('Failed to delete message:', error);
      }
    } else {
      setDeleteConfirm(messageId);
      // Auto-cancel confirmation after 3 seconds
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  }, [deleteConfirm, deleteMessage, loadMessages]);

  const getPositionLabel = (position: string) => {
    return LEADERSHIP_POSITIONS[position as keyof typeof LEADERSHIP_POSITIONS] || position;
  };

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'chairman': return 'bg-purple-100 text-purple-800';
      case 'principal': return 'bg-blue-100 text-blue-800';
      case 'vice_principal': return 'bg-green-100 text-green-800';
      case 'manager': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading messages...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800">Error loading messages: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Leadership Messages</h1>
        </div>
        <button
          onClick={onAddMessage}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Message
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages by name, title, or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={filterPosition}
            onChange={(e) => setFilterPosition(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="all">All Positions</option>
            <option value="chairman">Chairman</option>
            <option value="principal">Principal</option>
            <option value="vice_principal">Vice Principal</option>
            <option value="manager">Manager</option>
          </select>
        </div>
      </div>

      {/* Messages Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredMessages.length} of {(messages || []).length} messages
      </div>

      {/* Messages Grid */}
      {filteredMessages.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterPosition !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by adding your first leadership message.'}
          </p>
          {(!searchTerm && filterPosition === 'all') && (
            <button
              onClick={onAddMessage}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add First Message
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMessages.map((message) => (
            <div key={message.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              {/* Message Photo */}
              <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-t-lg overflow-hidden">
                {message.photo_url ? (
                  <img 
                    src={message.photo_url} 
                    alt={message.person_name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Message Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-lg leading-tight">{message.person_name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPositionColor(message.position)}`}>
                    {getPositionLabel(message.position)}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-3">{message.person_title}</p>
                
                {message.message_content && (
                  <p className="text-gray-500 text-sm line-clamp-3 mb-4">
                    {message.message_content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                  </p>
                )}

                {/* Status Badge */}
                <div className="mb-4">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                    message.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {message.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewMessage(message)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  
                  <button
                    onClick={() => onEditMessage(message)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  
                  <button
                    onClick={() => handleDeleteMessage(message.id)}
                    className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm rounded-md transition-colors ${
                      deleteConfirm === message.id
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                    {deleteConfirm === message.id ? 'Confirm' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeadershipMessagesManager;