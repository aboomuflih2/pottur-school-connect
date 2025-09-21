import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { djangoAPI } from '@/lib/django-api';
import { toast } from 'sonner';
import { AcademicProgram, ProgramFormData, ImageUploadResponse } from '../../types/academic';
import AcademicProgramsGrid from '../../components/admin/AcademicProgramsGrid';
import ActionToolbar from '../../components/admin/ActionToolbar';
import ProgramForm from '../../components/admin/ProgramForm';
import { EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { uploadImage } from '@/utils/imageUpload';

interface FilterOptions {
  category: string;
  status: string;
  search: string;
}

export default function Academics() {
    const queryClient = useQueryClient();
    const [editingProgram, setEditingProgram] = useState<AcademicProgram | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [viewingProgram, setViewingProgram] = useState<AcademicProgram | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [filters, setFilters] = useState<FilterOptions>({
        category: '',
        status: '',
        search: ''
      });

    const { data: programs = [], isLoading } = useQuery<AcademicProgram[], Error>({
        queryKey: ['academicPrograms'],
        queryFn: async () => {
            // @ts-ignore
            const response = await djangoAPI.getPrograms();
            // @ts-ignore
            return response.results;
        },
    });

    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['academicPrograms'] });
            setIsFormOpen(false);
            setEditingProgram(null);
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    };

    const createMutation = useMutation({
        mutationFn: (programData: any) => djangoAPI.createProgram(programData),
        ...mutationOptions,
    });

    const updateMutation = useMutation({
        mutationFn: (programData: any) => djangoAPI.updateProgram(editingProgram!.id, programData),
        ...mutationOptions,
    });

    const deleteMutation = useMutation({
        mutationFn: (programId: string) => djangoAPI.deleteProgram(programId),
        ...mutationOptions,
    });

    const toggleStatusMutation = useMutation({
        mutationFn: ({ programId, is_active }: { programId: string, is_active: boolean }) => djangoAPI.updateProgram(programId, { is_active }),
        ...mutationOptions,
    });

  const filteredPrograms = useMemo(() => {
    return programs.filter(program => {
      const matchesSearch = !filters.search || 
        program.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        program.description.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesCategory = !filters.category || program.program_type === filters.category;
      
      const matchesStatus = !filters.status || 
        (filters.status === 'active' && program.is_active) ||
        (filters.status === 'inactive' && !program.is_active);
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [programs, filters]);

  const handleView = (program: AcademicProgram) => {
    setViewingProgram(program);
    setIsViewModalOpen(true);
  };

  const handleFormSubmit = async (data: ProgramFormData) => {
    try {
        let imageUrl = editingProgram?.main_image || null;
      
        if (data.image_file) {
          const uploadResult = await uploadImage(data.image_file);
          imageUrl = uploadResult.url;
        }

        const programData = {
          name: data.program_title,
          description: data.full_description,
          program_type: data.category,
          is_active: data.is_active,
          main_image: imageUrl
        };

        if (editingProgram) {
          updateMutation.mutate(programData);
        } else {
          createMutation.mutate(programData);
        }

      } catch (error) {
        toast.error('Failed to save program');
      }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingProgram(null);
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
        <div className="p-6">
          <AcademicProgramsGrid
            programs={[]}
            onEdit={() => {}}
            onDelete={() => {}}
            onView={() => {}}
            onToggleStatus={() => {}}
            isLoading={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Academic Programs</h1>
            <p className="text-gray-600 mt-1">Manage your institution's academic programs and courses</p>
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <ActionToolbar
            onFilterChange={handleFilterChange}
            totalCount={programs.length}
            filteredCount={filteredPrograms.length}
            isLoading={isLoading}
          />

      {/* Main Content */}
      <div className="p-6">
        <AcademicProgramsGrid
          programs={filteredPrograms}
          onEdit={(program) => {
            setEditingProgram(program);
            setIsFormOpen(true);
          }}
          onDelete={(programId) => deleteMutation.mutate(programId)}
          onView={handleView}
          onToggleStatus={(programId, isActive) => toggleStatusMutation.mutate({ programId, is_active: isActive })}
          isLoading={isLoading}
        />
      </div>

      {/* Program Form Modal */}
      <ProgramForm
        program={editingProgram}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        onImageUpload={uploadImage}
        isLoading={createMutation.isPending || updateMutation.isPending}
        isOpen={isFormOpen}
      />

      {/* View Program Modal */}
      {isViewModalOpen && viewingProgram && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Program Details</h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image */}
                <div>
                  {viewingProgram.main_image ? (
                    <img
                      src={viewingProgram.main_image}
                      alt={viewingProgram.name}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                      <EyeIcon className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {viewingProgram.name}
                    </h3>
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        viewingProgram.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {viewingProgram.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-sm text-gray-500">
                        Category: {viewingProgram.program_type}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Short Description</h4>
                    <p className="text-gray-700">{viewingProgram.description}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Created:</span>
                      <br />
                      {formatDate(viewingProgram.created_at)}
                    </div>
                    <div>
                      <span className="font-medium">Last Updated:</span>
                      <br />
                      {formatDate(viewingProgram.updated_at)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setEditingProgram(viewingProgram);
                  setIsFormOpen(true);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Edit Program
              </button>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
