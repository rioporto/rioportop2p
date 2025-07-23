import { useState, useEffect, useCallback } from 'react';

// Breakpoints
const BREAKPOINTS = {
  mobile: 640,
  tablet: 1024,
  desktop: 1280,
} as const;

// Device detection
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < BREAKPOINTS.mobile);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return isMobile;
};

export const useIsTablet = () => {
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsTablet(width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return isTablet;
};

export const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsDesktop(window.innerWidth >= BREAKPOINTS.desktop);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return isDesktop;
};

// Orientation detection
export const useOrientation = () => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const checkOrientation = () => {
      setOrientation(
        window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
      );
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  return orientation;
};

// Keyboard height detection
export const useKeyboardHeight = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const handleViewportChange = () => {
      if (window.visualViewport) {
        const height = window.innerHeight - window.visualViewport.height;
        setKeyboardHeight(height);
      }
    };

    window.visualViewport?.addEventListener('resize', handleViewportChange);
    return () => {
      window.visualViewport?.removeEventListener('resize', handleViewportChange);
    };
  }, []);

  return keyboardHeight;
};

// Safe area detection (for iOS devices)
export const useSafeArea = () => {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  useEffect(() => {
    const computeSafeArea = () => {
      const style = getComputedStyle(document.documentElement);
      setSafeArea({
        top: parseInt(style.getPropertyValue('--sat') || '0'),
        right: parseInt(style.getPropertyValue('--sar') || '0'),
        bottom: parseInt(style.getPropertyValue('--sab') || '0'),
        left: parseInt(style.getPropertyValue('--sal') || '0'),
      });
    };

    // Set CSS variables for safe areas
    const root = document.documentElement;
    root.style.setProperty('--sat', 'env(safe-area-inset-top)');
    root.style.setProperty('--sar', 'env(safe-area-inset-right)');
    root.style.setProperty('--sab', 'env(safe-area-inset-bottom)');
    root.style.setProperty('--sal', 'env(safe-area-inset-left)');

    computeSafeArea();
    window.addEventListener('resize', computeSafeArea);

    return () => window.removeEventListener('resize', computeSafeArea);
  }, []);

  return safeArea;
};

// Touch detection
export const useTouch = () => {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-ignore
      navigator.msMaxTouchPoints > 0
    );
  }, []);

  return isTouch;
};

// Viewport dimensions with safe areas
export const useViewport = () => {
  const [viewport, setViewport] = useState({
    width: 0,
    height: 0,
    safeWidth: 0,
    safeHeight: 0,
  });

  const safeArea = useSafeArea();

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
        safeWidth: window.innerWidth - safeArea.left - safeArea.right,
        safeHeight: window.innerHeight - safeArea.top - safeArea.bottom,
      });
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    window.visualViewport?.addEventListener('resize', updateViewport);

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.visualViewport?.removeEventListener('resize', updateViewport);
    };
  }, [safeArea]);

  return viewport;
};

// Combined responsive hook
export const useResponsive = () => {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();
  const orientation = useOrientation();
  const isTouch = useTouch();
  const viewport = useViewport();
  const safeArea = useSafeArea();
  const keyboardHeight = useKeyboardHeight();

  return {
    isMobile,
    isTablet,
    isDesktop,
    orientation,
    isTouch,
    viewport,
    safeArea,
    keyboardHeight,
    breakpoints: BREAKPOINTS,
  };
};

// Utility function for responsive values
export const getResponsiveValue = <T,>(
  mobile: T,
  tablet: T,
  desktop: T,
  currentDevice: 'mobile' | 'tablet' | 'desktop'
): T => {
  switch (currentDevice) {
    case 'mobile':
      return mobile;
    case 'tablet':
      return tablet;
    case 'desktop':
      return desktop;
    default:
      return mobile;
  }
};

// Hook for responsive values
export const useResponsiveValue = <T,>(mobile: T, tablet: T, desktop: T): T => {
  const { isMobile, isTablet } = useResponsive();
  
  if (isMobile) return mobile;
  if (isTablet) return tablet;
  return desktop;
};

// Haptic feedback
export const useHaptic = () => {
  const vibrate = useCallback((pattern: number | number[] = 10) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  return {
    light: () => vibrate(10),
    medium: () => vibrate(20),
    heavy: () => vibrate(30),
    success: () => vibrate([10, 50, 10]),
    warning: () => vibrate([20, 100, 20]),
    error: () => vibrate([30, 50, 30, 50, 30]),
  };
};