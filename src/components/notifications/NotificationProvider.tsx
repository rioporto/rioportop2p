import React, { createContext, useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ToastContainer, NotificationType, NotificationPosition } from './NotificationToast';
import { Notification } from './NotificationCenter';

interface NotificationOptions {
  type: NotificationType;
  title: string;
  description?: string;
  duration?: number;
  position?: NotificationPosition;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }>;
  avatar?: string;
  playSound?: boolean;
  persist?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  toasts: Array<NotificationOptions & { id: string }>;
  unreadCount: number;
  soundEnabled: boolean;
  
  // Methods
  addNotification: (options: NotificationOptions) => string;
  removeToast: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  toggleSound: () => void;
}

export const NotificationContext = createContext<NotificationContextType | null>(null);

interface NotificationProviderProps {
  children: React.ReactNode;
  defaultPosition?: NotificationPosition;
  maxToasts?: number;
  persistKey?: string;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  defaultPosition = 'top-right',
  maxToasts = 5,
  persistKey = 'rioporto-notifications'
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<Array<NotificationOptions & { id: string }>>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const notificationIdRef = useRef(0);

  // Load persisted data
  useEffect(() => {
    const loadPersistedData = () => {
      try {
        const persisted = localStorage.getItem(persistKey);
        if (persisted) {
          const data = JSON.parse(persisted);
          setNotifications(data.notifications.map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp)
          })));
          setSoundEnabled(data.soundEnabled ?? true);
        }
      } catch (error) {
        console.error('Failed to load persisted notifications:', error);
      }
    };

    loadPersistedData();
  }, [persistKey]);

  // Persist data
  useEffect(() => {
    const persistData = () => {
      try {
        localStorage.setItem(persistKey, JSON.stringify({
          notifications,
          soundEnabled
        }));
      } catch (error) {
        console.error('Failed to persist notifications:', error);
      }
    };

    persistData();
  }, [notifications, soundEnabled, persistKey]);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Add notification
  const addNotification = useCallback((options: NotificationOptions): string => {
    const id = `notification-${Date.now()}-${notificationIdRef.current++}`;
    const timestamp = new Date();

    // Add to persistent notifications
    if (options.persist !== false) {
      const notification: Notification = {
        id,
        type: options.type,
        title: options.title,
        description: options.description,
        timestamp,
        read: false,
        avatar: options.avatar
      };

      setNotifications(prev => [notification, ...prev]);
    }

    // Add to toasts
    const toast = {
      ...options,
      id,
      timestamp,
      position: options.position || defaultPosition
    };

    setToasts(prev => {
      const newToasts = [toast, ...prev];
      // Limit number of toasts
      return newToasts.slice(0, maxToasts);
    });

    // Play sound if enabled
    if (options.playSound !== false && soundEnabled) {
      try {
        const audio = new Audio('/sounds/notification.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {
          // Ignore errors
        });
      } catch (error) {
        // Ignore errors
      }
    }

    // Track analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'notification_shown', {
        notification_type: options.type,
        notification_title: options.title
      });
    }

    return id;
  }, [defaultPosition, maxToasts, soundEnabled]);

  // Remove toast
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Mark as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  }, []);

  // Delete notification
  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    removeToast(id);
  }, [removeToast]);

  // Clear all
  const clearAll = useCallback(() => {
    setNotifications([]);
    setToasts([]);
  }, []);

  // Toggle sound
  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);

  // Request permission for browser notifications
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Show browser notification
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const latestNotification = notifications[0];
      if (latestNotification && !latestNotification.read) {
        try {
          new Notification(latestNotification.title, {
            body: latestNotification.description,
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            vibrate: [200, 100, 200]
          });
        } catch (error) {
          // Ignore errors
        }
      }
    }
  }, [notifications]);

  const value: NotificationContextType = {
    notifications,
    toasts,
    unreadCount,
    soundEnabled,
    addNotification,
    removeToast,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    toggleSound
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Toast Container */}
      <AnimatePresence>
        {toasts.length > 0 && (
          <ToastContainer
            notifications={toasts}
            position={defaultPosition}
            onClose={removeToast}
          />
        )}
      </AnimatePresence>
    </NotificationContext.Provider>
  );
};