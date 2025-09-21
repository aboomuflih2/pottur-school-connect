import React, { useState } from 'react';
import LeadershipManager from '@/components/admin/LeadershipManager';
import MemberForm from '@/components/admin/MemberForm';
import MemberProfileModal from '@/components/MemberProfileModal';
import { BoardMember } from '../../../shared/types/board-members';

const Leadership = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<BoardMember | null>(null);
  const [viewingMember, setViewingMember] = useState<BoardMember | null>(null);

  const handleAddMember = () => {
    setEditingMember(null);
    setShowForm(true);
  };

  const handleEditMember = (member: BoardMember) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const handleViewMember = (member: BoardMember) => {
    setViewingMember(member);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingMember(null);
    // Refresh the page or trigger a re-fetch here if needed
    window.location.reload();
  };

  const handleCloseModal = () => {
    setViewingMember(null);
  };

  if (showForm) {
    return (
      <MemberForm 
        member={editingMember}
        onClose={handleCloseForm}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Board Members Management</h1>
        <p className="text-muted-foreground">Manage school board members and leadership team</p>
      </div>

      <LeadershipManager 
        onAddMember={handleAddMember}
        onEditMember={handleEditMember}
        onViewMember={handleViewMember}
      />

      {viewingMember && (
        <MemberProfileModal 
          member={viewingMember}
          isOpen={true}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Leadership;