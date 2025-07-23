import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { useSafeArea, useHaptic } from '@/hooks/useResponsive';
import {
  HomeIcon,
  UsersIcon,
  CalendarIcon,
  TrophyIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  UsersIcon as UsersIconSolid,
  CalendarIcon as CalendarIconSolid,
  TrophyIcon as TrophyIconSolid,
  UserIcon as UserIconSolid,
} from '@heroicons/react/24/solid';

interface NavItem {
  id: string;
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  activeIcon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const navItems: NavItem[] = [
  {
    id: 'home',
    path: '/',
    label: 'Início',
    icon: HomeIcon,
    activeIcon: HomeIconSolid,
  },
  {
    id: 'players',
    path: '/players',
    label: 'Jogadores',
    icon: UsersIcon,
    activeIcon: UsersIconSolid,
  },
  {
    id: 'events',
    path: '/events',
    label: 'Eventos',
    icon: CalendarIcon,
    activeIcon: CalendarIconSolid,
    badge: 3,
  },
  {
    id: 'matches',
    path: '/matches',
    label: 'Partidas',
    icon: TrophyIcon,
    activeIcon: TrophyIconSolid,
  },
  {
    id: 'profile',
    path: '/profile',
    label: 'Perfil',
    icon: UserIcon,
    activeIcon: UserIconSolid,
  },
];

interface MobileNavProps {
  showLabels?: boolean;
}

export const MobileNav: React.FC<MobileNavProps> = ({ showLabels = true }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const safeArea = useSafeArea();
  const haptic = useHaptic();
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Hide nav on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleNavClick = (path: string) => {
    haptic.light();
    navigate(path);
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`
            fixed bottom-0 left-0 right-0 z-50
            ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}
            border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}
            backdrop-blur-xl bg-opacity-95
          `}
          style={{
            paddingBottom: safeArea.bottom || 0,
          }}
        >
          <div className="flex items-center justify-around h-16">
            {navItems.map((item) => {
              const active = isActive(item.path);
              const Icon = active ? item.activeIcon : item.icon;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.path)}
                  className="
                    relative flex flex-col items-center justify-center
                    w-full h-full px-2 py-1
                    transition-all duration-200
                    active:scale-95
                  "
                >
                  {/* Active indicator */}
                  {active && (
                    <motion.div
                      layoutId="activeTab"
                      className="
                        absolute top-0 left-1/2 -translate-x-1/2
                        w-12 h-0.5 bg-primary-500 rounded-full
                      "
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}

                  {/* Icon with badge */}
                  <div className="relative">
                    <Icon
                      className={`
                        w-6 h-6 transition-all duration-200
                        ${active
                          ? 'text-primary-500'
                          : theme === 'dark'
                          ? 'text-gray-400'
                          : 'text-gray-600'
                        }
                      `}
                    />
                    
                    {/* Badge */}
                    {item.badge && item.badge > 0 && (
                      <div
                        className="
                          absolute -top-1 -right-1
                          min-w-[18px] h-[18px]
                          flex items-center justify-center
                          bg-red-500 text-white
                          text-[10px] font-bold
                          rounded-full px-1
                        "
                      >
                        {item.badge > 99 ? '99+' : item.badge}
                      </div>
                    )}
                  </div>

                  {/* Label */}
                  {showLabels && (
                    <span
                      className={`
                        text-[10px] mt-1 transition-all duration-200
                        ${active
                          ? 'text-primary-500 font-medium'
                          : theme === 'dark'
                          ? 'text-gray-400'
                          : 'text-gray-600'
                        }
                      `}
                    >
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
};

// Tab indicator component for custom navigation
export const TabIndicator: React.FC<{
  activeIndex: number;
  itemCount: number;
}> = ({ activeIndex, itemCount }) => {
  const itemWidth = 100 / itemCount;
  
  return (
    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-800">
      <motion.div
        className="h-full bg-primary-500"
        initial={false}
        animate={{
          x: `${activeIndex * itemWidth}%`,
          width: `${itemWidth}%`,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </div>
  );
};

// Floating Action Button for mobile
export const MobileFAB: React.FC<{
  icon: React.ReactNode;
  onClick: () => void;
  badge?: number;
}> = ({ icon, onClick, badge }) => {
  const { theme } = useTheme();
  const haptic = useHaptic();
  const safeArea = useSafeArea();

  const handleClick = () => {
    haptic.medium();
    onClick();
  };

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      className={`
        fixed z-50
        w-14 h-14 rounded-full
        flex items-center justify-center
        shadow-lg
        ${theme === 'dark'
          ? 'bg-primary-600 text-white'
          : 'bg-primary-500 text-white'
        }
      `}
      style={{
        right: 16,
        bottom: 80 + (safeArea.bottom || 0),
      }}
    >
      {icon}
      
      {badge && badge > 0 && (
        <div
          className="
            absolute -top-1 -right-1
            min-w-[20px] h-[20px]
            flex items-center justify-center
            bg-red-500 text-white
            text-xs font-bold
            rounded-full px-1
          "
        >
          {badge > 99 ? '99+' : badge}
        </div>
      )}
    </motion.button>
  );
};