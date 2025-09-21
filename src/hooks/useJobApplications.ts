import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { djangoAPI } from '@/lib/django-api';
import type { JobApplication, JobApplicationFormData } from '@/types/job-applications';
import { useToast } from '@/hooks/use-toast';

export const useJobApplications = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error, refetch } = useQuery<JobApplication[], Error>({
    queryKey: ['jobApplications'],
    queryFn: async () => {
      // @ts-ignore
      const response = await djangoAPI.getJobApplications();
      // @ts-ignore
      return response.results;
    }
  });

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobApplications'] });
    },
  };

  const submitApplicationMutation = useMutation({
    mutationFn: (formData: JobApplicationFormData) => {
      const apiData = new FormData();
      // @ts-ignore
      Object.keys(formData).forEach(key => {
        // @ts-ignore
        if (formData[key]) {
            // @ts-ignore
            apiData.append(key, formData[key]);
        }
      });
      return djangoAPI.createJobApplication(apiData);
    },
    ...mutationOptions,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your job application has been submitted successfully!",
      });
      mutationOptions.onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const deleteApplicationMutation = useMutation({
    mutationFn: (id: string) => djangoAPI.deleteJobApplication(id),
    ...mutationOptions,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Application deleted successfully",
      });
      mutationOptions.onSuccess();
    }
  });

  return {
    applications: data || [],
    loading: isLoading,
    error: error?.message || null,
    fetchApplications: refetch,
    submitApplication: submitApplicationMutation.mutateAsync,
    deleteApplication: deleteApplicationMutation.mutateAsync,
  };
};
