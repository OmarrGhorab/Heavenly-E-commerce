// hooks/useComments.ts
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Comment, CommentsResponse } from '@/types/Comment';
import axiosInstance from '@/lib/axios';

export const useComments = (productId: string) => {
  const queryClient = useQueryClient();
  const limit = 10;

  const infiniteQuery = useInfiniteQuery<CommentsResponse>({
    queryKey: ['comments', productId],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await axiosInstance.get<CommentsResponse>(
        `/products/${productId}/comments`,
        { params: { page: pageParam, limit } }
      );
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      const hasMore = lastPage.page * lastPage.limit < lastPage.totalComments;
      return hasMore ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const addCommentMutation = useMutation({
    mutationFn: async (payload: { content: string }) => {
      const { data } = await axiosInstance.post<{ comment: Comment }>(
        `/products/${productId}/comments`,
        payload
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', productId] });
    },
  });

  const editCommentMutation = useMutation({
    mutationFn: async ({
      commentId,
      payload,
    }: {
      commentId: string;
      payload: { content?: string };
    }) => {
      const { data } = await axiosInstance.patch<{ comment: Comment }>(
        `/products/${productId}/${commentId}`,
        payload
      );
      return data.comment; // Return just the comment object
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', productId] });
    },
  });

  return {
    infiniteQuery,
    addComment: addCommentMutation.mutateAsync,
    editComment: editCommentMutation.mutateAsync,
    isAdding: addCommentMutation.isPending,
    isEditing: editCommentMutation.isPending,
    error: addCommentMutation.error || editCommentMutation.error,
  };
};