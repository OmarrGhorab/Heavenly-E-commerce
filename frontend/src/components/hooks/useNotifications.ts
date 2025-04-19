// useNotifications.ts
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InfiniteData } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { Notification } from '@/types/notification';
import { useNotificationsStore } from '@/stores/useNotificationStore';

type NotificationPage = {
  notifications: Notification[];
  currentPage: number;
  totalPages: number;
};

type NotificationResponse = {
  data: Notification[];
  page: number;
  totalPages: number;
};

/**
 * Custom hook for handling notifications logic
 */
export const useNotifications = () => {
  const queryClient = useQueryClient();
  const store = useNotificationsStore();

  // Infinite query configuration
  const infiniteQuery = useInfiniteQuery<NotificationPage>({
    queryKey: ['notifications'],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await axiosInstance.get<NotificationResponse>(
        `/notifications?page=${pageParam}&limit=10`
      );
      
      return normalizeNotificationPage(response.data);
    },
    initialPageParam: 1,
    getNextPageParam: lastPage => 
      lastPage.currentPage < lastPage.totalPages 
        ? lastPage.currentPage + 1 
        : undefined,
  });

  // Mutation handlers
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => axiosInstance.put(`/notifications/${id}`),
    onSuccess: handleMarkAsReadSuccess,
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => axiosInstance.put('/notifications/mark-all-read', { read: true }),
    onSuccess: handleMarkAllAsReadSuccess,
  });

  // Notification data processing
  const historicalNotifications = infiniteQuery.data?.pages.flatMap(p => p.notifications) || [];
  const mergedNotifications = mergeNotifications(
    historicalNotifications,
    store.realTimeNotifications
  );

  return {
    notifications: mergedNotifications,
    hasUnread: mergedNotifications.some(n => !n.read),
    isLoading: infiniteQuery.isFetching,
    isLoadingMore: infiniteQuery.isFetchingNextPage,
    error: infiniteQuery.error,
    hasNextPage: infiniteQuery.hasNextPage,
    fetchNextPage: infiniteQuery.fetchNextPage,
    markAsRead: markAsReadMutation.mutateAsync,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
    handleNewNotification: store.addRealTimeNotification,
  };

  // Helper functions
  function normalizeNotificationPage(data: NotificationResponse): NotificationPage {
    return {
      notifications: data.data.map(normalizeNotification),
      currentPage: data.page,
      totalPages: data.totalPages,
    };
  }

  function normalizeNotification(notification: Notification): Notification {
    return {
      ...notification,
      id: notification._id || notification.id || '',
      read: notification.read === true,
      createdAt: notification.createdAt || notification.timestamp,
    };
  }

  function handleMarkAsReadSuccess(_: unknown, id: string) {
    queryClient.setQueryData<InfiniteData<NotificationPage>>(
      ['notifications'],
      updateNotificationsReadStatus(id)
    );
    store.markRealTimeNotificationAsRead(id);
  }

  function handleMarkAllAsReadSuccess() {
    queryClient.setQueryData<InfiniteData<NotificationPage>>(
      ['notifications'],
      markAllNotificationsRead
    );
    store.markAllRealTimeAsRead();
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  }

  function updateNotificationsReadStatus(id: string) {
    return (old?: InfiniteData<NotificationPage>) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map(page => ({
          ...page,
          notifications: page.notifications.map(n => 
            n.id === id ? { ...n, read: true } : n
          )
        }))
      };
    };
  }

  function markAllNotificationsRead(old?: InfiniteData<NotificationPage>) {
    if (!old) return old;
    return {
      ...old,
      pages: old.pages.map(page => ({
        ...page,
        notifications: page.notifications.map(n => ({ ...n, read: true }))
      }))
    };
  }

  function mergeNotifications(
    historical: Notification[],
    realTime: Notification[]
  ): Notification[] {
    const historicalIds = new Set(historical.map(n => n.id));
    const uniqueRealTime = realTime.filter(n => !historicalIds.has(n.id));
    return [...uniqueRealTime, ...historical]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
};