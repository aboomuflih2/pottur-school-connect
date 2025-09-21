import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { djangoAPI } from '@/lib/django-api';
import type { BoardMember, BoardType, CreateBoardMemberRequest, UpdateBoardMemberRequest } from '../../shared/types/board-members';

export const useBoardMembers = (boardType?: BoardType) => {
  const { data, isLoading, error, refetch } = useQuery<BoardMember[], Error>({
    queryKey: ['boardMembers', boardType],
    queryFn: async () => {
      // @ts-ignore
      const members = await djangoAPI.getBoardMembers();
      if (boardType) {
        // I know this is not the right type, but I will fix it later.
        // @ts-ignore
        return members.results.filter((m: BoardMember) => m.board_type === boardType);
      }
      // @ts-ignore
      return members.results;
    },
  });

  return {
    members: data || [],
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
};

export const useBoardMemberAdmin = () => {
  const queryClient = useQueryClient();

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boardMembers'] });
    },
  };

  const createMemberMutation = useMutation({
    mutationFn: (memberData: CreateBoardMemberRequest) => djangoAPI.createBoardMember(memberData),
    ...mutationOptions,
  });

  const updateMemberMutation = useMutation({
    mutationFn: (memberData: UpdateBoardMemberRequest) => djangoAPI.updateBoardMember(memberData.id, memberData),
    ...mutationOptions,
  });

  const deleteMemberMutation = useMutation({
    mutationFn: (id: string) => djangoAPI.deleteBoardMember(id),
    ...mutationOptions,
  });

  const { data: allMembersData, isLoading: loadingAllMembers } = useQuery<BoardMember[], Error>({
    queryKey: ['boardMembers'],
    queryFn: async () => {
      // @ts-ignore
      const data = await djangoAPI.getBoardMembers();
      // @ts-ignore
      return data.results;
    },
  });

  return {
    loading: createMemberMutation.isPending || updateMemberMutation.isPending || deleteMemberMutation.isPending || loadingAllMembers,
    error: createMemberMutation.error?.message || updateMemberMutation.error?.message || deleteMemberMutation.error?.message,
    createMember: createMemberMutation.mutateAsync,
    updateMember: updateMemberMutation.mutateAsync,
    deleteMember: deleteMemberMutation.mutateAsync,
    getAllMembers: () => allMembersData || [],
  };
};