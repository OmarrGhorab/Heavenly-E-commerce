// useNotificationStore.ts
import { create } from 'zustand';
import { Notification } from '@/types/notification';

type NotificationStore = {
  realTimeNotifications: Notification[];
  addRealTimeNotification: (notification: Notification) => void;
  markRealTimeNotificationAsRead: (id: string) => void;
  markAllRealTimeAsRead: () => void;
};

/**
 * Zustand store for managing real-time notifications
 */
export const useNotificationsStore = create<NotificationStore>((set) => ({
  realTimeNotifications: [],

  addRealTimeNotification: (notification) => {
    set((state) => {
      const normalized = normalizeRealTimeNotification(notification);
      return shouldAddNotification(state.realTimeNotifications, normalized)
        ? { realTimeNotifications: [...state.realTimeNotifications, normalized] }
        : state;
    });
  },

  markRealTimeNotificationAsRead: (id) => {
    set((state) => ({
      realTimeNotifications: updateNotificationReadStatus(state.realTimeNotifications, id),
    }));
  },

  markAllRealTimeAsRead: () => {
    set((state) => ({
      realTimeNotifications: markAllNotificationsRead(state.realTimeNotifications),
    }));
  },
}));

// Helper functions
function normalizeRealTimeNotification(notification: Notification): Notification {
  return {
    ...notification,
    id: notification._id || notification.id || '',
    read: false,
    createdAt: notification.createdAt || new Date().toISOString(),
  };
}

function shouldAddNotification(existing: Notification[], newNotification: Notification): boolean {
  return !existing.some(n => n.id === newNotification.id);
}

function updateNotificationReadStatus(notifications: Notification[], id: string): Notification[] {
  return notifications.map(n => 
    (n._id === id || n.id === id) ? { ...n, read: true } : n
  );
}

function markAllNotificationsRead(notifications: Notification[]): Notification[] {
  return notifications.map(n => ({ ...n, read: true }));
}