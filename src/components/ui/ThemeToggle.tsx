"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function ThemeToggle({ 
  className = '', 
  showLabel = false,
  size = 'md' 
}: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme, isLoading } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Tamanhos
  const sizes = {
    sm: { button: 'w-12 h-12', icon: 'w-5 h-5', particle: 'w-1 h-1' },
    md: { button: 'w-14 h-14', icon: 'w-6 h-6', particle: 'w-1.5 h-1.5' },
    lg: { button: 'w-16 h-16', icon: 'w-8 h-8', particle: 'w-2 h-2' },
  };

  const currentSize = sizes[size];

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    toggleTheme();
    
    // Reset animation state
    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  };

  if (!mounted || isLoading) {
    return (
      <div className={`${currentSize.button} rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse ${className}`} />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        onClick={handleToggle}
        className={`
          relative ${currentSize.button} rounded-full
          bg-gradient-to-br from-blue-400 to-blue-600 dark:from-indigo-600 dark:to-purple-800
          shadow-lg hover:shadow-xl
          transform transition-all duration-300 hover:scale-105
          focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-purple-500
          overflow-hidden
          ${isAnimating ? 'scale-95' : ''}
        `}
        aria-label={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      >
        {/* Background gradient animation */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent transform -translate-x-full hover:translate-x-full transition-transform duration-1000" />
        
        {/* Stars background for dark mode */}
        <AnimatePresence>
          {isDark && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={`star-${i}`}
                  className="absolute w-0.5 h-0.5 bg-white rounded-full"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0.4, 0.8, 0.4],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{
                    duration: 2,
                    delay: i * 0.1,
                    repeat: Infinity,
                  }}
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${15 + (i % 2) * 30}%`,
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Sun/Moon icon container */}
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {isDark ? (
              <motion.div
                key="moon"
                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0, rotate: 180, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="relative"
              >
                {/* Moon */}
                <div className={`${currentSize.icon} relative`}>
                  <div className="absolute inset-0 bg-white rounded-full shadow-lg" />
                  <div className="absolute -top-1 -right-1 w-4/5 h-4/5 bg-gradient-to-br from-indigo-600 to-purple-800 rounded-full" />
                </div>
                
                {/* Moon glow */}
                <div className="absolute inset-0 -m-2">
                  <div className="w-full h-full bg-white/20 rounded-full blur-md animate-pulse" />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="sun"
                initial={{ scale: 0, rotate: 180, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0, rotate: -180, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="relative"
              >
                {/* Sun core */}
                <div className={`${currentSize.icon} bg-yellow-300 rounded-full shadow-lg relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 to-orange-400" />
                  <div className="absolute inset-1 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full" />
                </div>
                
                {/* Sun rays */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={`ray-${i}`}
                    className="absolute top-1/2 left-1/2 w-1 h-8 bg-gradient-to-b from-yellow-300 to-transparent"
                    style={{
                      transformOrigin: 'center bottom',
                    }}
                    animate={{
                      rotate: i * 45,
                      scale: [1, 1.2, 1],
                      opacity: [0.6, 1, 0.6],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  />
                ))}
                
                {/* Sun particles */}
                <AnimatePresence>
                  {!isDark && isAnimating && (
                    <>
                      {[...Array(12)].map((_, i) => (
                        <motion.div
                          key={`particle-${i}`}
                          className={`absolute ${currentSize.particle} bg-yellow-400 rounded-full`}
                          initial={{ 
                            scale: 0,
                            x: 0,
                            y: 0,
                          }}
                          animate={{ 
                            scale: [0, 1.5, 0],
                            x: Math.cos((i * 30) * Math.PI / 180) * 30,
                            y: Math.sin((i * 30) * Math.PI / 180) * 30,
                            opacity: [0, 1, 0],
                          }}
                          transition={{
                            duration: 0.6,
                            ease: "easeOut",
                          }}
                          style={{
                            left: '50%',
                            top: '50%',
                          }}
                        />
                      ))}
                    </>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Ripple effect on click */}
        <AnimatePresence>
          {isAnimating && (
            <motion.div
              className="absolute inset-0 rounded-full"
              initial={{ scale: 0, opacity: 0.5 }}
              animate={{ scale: 2.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                background: isDark 
                  ? 'radial-gradient(circle, rgba(167, 139, 250, 0.4) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, transparent 70%)',
              }}
            />
          )}
        </AnimatePresence>
      </button>

      {/* Label */}
      {showLabel && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {isDark ? 'Modo Escuro' : 'Modo Claro'}
        </motion.span>
      )}
    </div>
  );
}

// Mini version for header
export function ThemeToggleMini() {
  const { resolvedTheme, toggleTheme, isLoading } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return (
      <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative w-9 h-9 rounded-lg
        bg-gray-100 dark:bg-gray-800
        hover:bg-gray-200 dark:hover:bg-gray-700
        transition-all duration-200
        flex items-center justify-center
        group
      `}
      aria-label={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
    >
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.svg
            key="moon-mini"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
            className="w-4 h-4 text-indigo-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </motion.svg>
        ) : (
          <motion.svg
            key="sun-mini"
            initial={{ scale: 0, rotate: 90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: -90 }}
            transition={{ duration: 0.2 }}
            className="w-4 h-4 text-yellow-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </motion.svg>
        )}
      </AnimatePresence>
      
      {/* Hover effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-transparent to-transparent group-hover:from-blue-500/10 group-hover:to-purple-500/10 dark:group-hover:from-indigo-500/10 dark:group-hover:to-purple-500/10 transition-all duration-300" />
    </button>
  );
}