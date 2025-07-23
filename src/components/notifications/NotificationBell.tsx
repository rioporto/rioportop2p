import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Bell, BellOff } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationCenter } from './NotificationCenter';

interface NotificationBellProps {
  showBadge?: boolean;
  playSound?: boolean;
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  showBadge = true,
  playSound = true,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const { notifications, unreadCount, markAllAsRead, soundEnabled } = useNotifications();

  // Shake animation when new notification arrives
  useEffect(() => {
    if (unreadCount > 0 && !hasNewNotification) {
      setHasNewNotification(true);
      
      // Trigger shake animation
      controls.start({
        rotate: [0, -15, 15, -15, 15, -10, 10, -5, 5, 0],
        transition: {
          duration: 0.5,
          ease: "easeInOut"
        }
      });

      // Play sound if enabled
      if (playSound && soundEnabled) {
        const audio = new Audio('/sounds/notification.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {
          // Ignore errors if sound can't be played
        });
      }
    } else if (unreadCount === 0) {
      setHasNewNotification(false);
    }
  }, [unreadCount, hasNewNotification, controls, playSound, soundEnabled]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      // Optional: Mark as read when opening
      // markAllAsRead();
    }
  };

  return (
    <div ref={bellRef} className={`relative ${className}`}>
      {/* Bell Button */}
      <motion.button
        animate={controls}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        className={`
          relative p-3 rounded-xl
          bg-gradient-to-br from-gray-800/50 to-gray-900/50
          border border-gray-700/50
          hover:border-orange-500/50
          transition-all duration-300
          group
        `}
      >
        {/* Glow Effect */}
        <div className={`
          absolute inset-0 rounded-xl
          bg-gradient-to-br from-orange-500/20 to-orange-600/20
          opacity-0 group-hover:opacity-100
          transition-opacity duration-300
          blur-xl
        `} />

        {/* Bell Icon */}
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: isOpen ? 30 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          className="relative z-10"
        >
          {soundEnabled ? (
            <Bell className="w-5 h-5 text-gray-300 group-hover:text-orange-400 transition-colors" />
          ) : (
            <BellOff className="w-5 h-5 text-gray-500 group-hover:text-gray-400 transition-colors" />
          )}
        </motion.div>

        {/* Badge */}
        {showBadge && unreadCount > 0 && (
          <AnimatePresence>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                transition: {
                  type: 'spring',
                  stiffness: 500,
                  damping: 15
                }
              }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-1 -right-1"
            >
              {/* Pulse Effect */}
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [1, 0, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-orange-500 rounded-full"
              />
              
              {/* Badge Number */}
              <motion.div
                animate={{
                  scale: hasNewNotification ? [1, 1.2, 1] : 1
                }}
                transition={{
                  duration: 0.3,
                  times: [0, 0.5, 1]
                }}
                className={`
                  relative min-w-[20px] h-5 px-1
                  flex items-center justify-center
                  bg-gradient-to-br from-orange-500 to-orange-600
                  rounded-full
                  text-[10px] font-bold text-white
                  shadow-lg shadow-orange-500/50
                `}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Unread Dot Indicator */}
        {unreadCount > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-0 right-0"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.7, 1]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-2 h-2 bg-green-500 rounded-full"
            />
          </motion.div>
        )}
      </motion.button>

      {/* Notification Center Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className={`
              absolute top-full right-0 mt-2
              w-96 max-w-[calc(100vw-2rem)]
              z-50
            `}
          >
            <NotificationCenter
              notifications={notifications}
              onClose={() => setIsOpen(false)}
              isDropdown
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};