import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Circle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useSocket } from './hooks/useSocket';
import notificationSound from '@/assets/notification.wav';
import { useNotifications } from './hooks/useNotifications';

const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [options]);

  return { ref, isIntersecting };
};

const NotificationBadge: React.FC = () => {
  const {
    notifications,
    hasUnread,
    isLoading,
    isLoadingMore,
    error: fetchError,
    hasNextPage,
    fetchNextPage,
    markAsRead,
    markAllAsRead,
    handleNewNotification
  } = useNotifications();
  
  const socket = useSocket();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Infinite scroll observer
  const { ref: sentinelRef, isIntersecting } = useIntersectionObserver({
    root: containerRef.current,
    threshold: 0.5,
  });



  useEffect(() => {
    if (isIntersecting && hasNextPage && !isLoadingMore) {
      fetchNextPage();
    }
  }, [isIntersecting, hasNextPage, isLoadingMore, fetchNextPage]);

  // WebSocket handlers
  useEffect(() => {
    if (!socket) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(notificationSound);
      audioRef.current.volume = 0.3;
    }

    const playSound = () => audioRef.current?.play().catch(console.error);

    const handleSocketNotification = (data: any) => {
      playSound();
      handleNewNotification(data);
    };

    socket.on('orderStatusUpdated', handleSocketNotification);
    socket.on('newOrder', handleSocketNotification);

    return () => {
      socket.off('orderStatusUpdated', handleSocketNotification);
      socket.off('newOrder', handleSocketNotification);
    };
  }, [socket, handleNewNotification]);

  return (
    <div className="relative notification-dropdown">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-full"
        aria-label='notifications'
      >
        <Bell className="w-6 h-6 text-gray-500" />
        {hasUnread && (
          <Circle className="w-3 h-3 text-red-500 absolute top-2 right-2 fill-red-500" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-sm:-right-14"
            ref={containerRef}
          >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-lg">Notifications</h3>
              <button
                onClick={() => markAllAsRead()}
                className="text-blue-600 text-sm hover:bg-gray-100 px-2 py-1 rounded"
              >
                Mark all as read
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <React.Fragment key={notification.id || notification._id}>
                    <Link
                      to={`/all-orders?page=1&search=${notification.orderId}`}
                      className="block border-b border-gray-100 hover:bg-gray-50"
                      onClick={() => markAsRead(notification.id || notification._id || "")}
                    >
                      <div className="p-4 flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-800">
                            {notification.message}
                            {notification.newStatus && (
                              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {notification.newStatus}
                              </span>
                            )}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(notification.createdAt))} ago
                            </span>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                    
                    {/* Add sentinel to last notification for infinite scroll */}
                    {index === notifications.length - 1 && (
                      <div ref={sentinelRef} className="h-2 w-full" />
                    )}
                  </React.Fragment>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  {isLoading ? 'Loading...' : 'No new notifications'}
                </div>
              )}

              {isLoadingMore && (
                <div className="p-4 flex justify-center">
                  <LoadingSpinner />
                </div>
              )}
            </div>

            {fetchError && (
              <div className="p-4 text-red-500 text-center">
                Error loading notifications
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Loading spinner component
const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400" />
);

export default NotificationBadge;
