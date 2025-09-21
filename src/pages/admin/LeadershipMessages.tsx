import React, { useState } from 'react';
import LeadershipMessagesManager from '@/components/admin/LeadershipMessagesManager';
import LeadershipMessageForm from '@/components/admin/LeadershipMessageForm';
import { LeadershipMessage } from '../../../shared/types/leadership-messages';

const LeadershipMessages = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingMessage, setEditingMessage] = useState<LeadershipMessage | null>(null);

  const handleAddMessage = () => {
    setEditingMessage(null);
    setShowForm(true);
  };

  const handleEditMessage = (message: LeadershipMessage) => {
    setEditingMessage(message);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingMessage(null);
    // Refresh the page or trigger a re-fetch here if needed
    window.location.reload();
  };

  if (showForm) {
    return (
      <LeadershipMessageForm 
        message={editingMessage}
        onClose={handleCloseForm}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Leadership Messages Management</h1>
        <p className="text-muted-foreground">Manage messages from chairman, principal, vice principal, and other leadership positions</p>
      </div>

      <LeadershipMessagesManager 
        onAddMessage={handleAddMessage}
        onEditMessage={handleEditMessage}
      />
    </div>
  );
};

export default LeadershipMessages;