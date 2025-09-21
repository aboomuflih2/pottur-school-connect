import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { djangoAPI } from '@/lib/django-api';
import type { LeadershipMessage, CreateLeadershipMessageRequest, UpdateLeadershipMessageRequest, LeadershipPosition } from '../../shared/types/leadership-messages';

export const useLeadershipMessages = (position?: LeadershipPosition) => {
  const { data, isLoading, error, refetch } = useQuery<LeadershipMessage[], Error>({
    queryKey: ['leadershipMessages', position],
    queryFn: async () => {
      // @ts-ignore
      const messages = await djangoAPI.getLeadershipMessages();
      if (position) {
        // @ts-ignore
        return messages.results.filter((m: LeadershipMessage) => m.position === position);
      }
      // @ts-ignore
      return messages.results;
    },
  });

  return {
    messages: data || [],
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
};

export const useLeadershipMessagesAdmin = () => {
  const queryClient = useQueryClient();

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leadershipMessages'] });
    },
  };

  const createMessageMutation = useMutation({
    mutationFn: (messageData: CreateLeadershipMessageRequest) => djangoAPI.createLeadershipMessage(messageData),
    ...mutationOptions,
  });

  const updateMessageMutation = useMutation({
    mutationFn: (messageData: UpdateLeadershipMessageRequest & { id: string }) => djangoAPI.updateLeadershipMessage(messageData.id, messageData),
    ...mutationOptions,
  });

  const deleteMessageMutation = useMutation({
    mutationFn: (id: string) => djangoAPI.deleteLeadershipMessage(id),
    ...mutationOptions,
  });

  const { data: allMessagesData, isLoading: loadingAllMessages } = useQuery<LeadershipMessage[], Error>({
    queryKey: ['leadershipMessages'],
    queryFn: async () => {
      // @ts-ignore
      const data = await djangoAPI.getLeadershipMessages();
      // @ts-ignore
      return data.results;
    },
  });

  return {
    loading: createMessageMutation.isPending || updateMessageMutation.isPending || deleteMessageMutation.isPending || loadingAllMessages,
    error: createMessageMutation.error?.message || updateMessageMutation.error?.message || deleteMessageMutation.error?.message,
    createMessage: createMessageMutation.mutateAsync,
    updateMessage: updateMessageMutation.mutateAsync,
    deleteMessage: deleteMessageMutation.mutateAsync,
    getAllMessages: () => allMessagesData || [],
  };
};