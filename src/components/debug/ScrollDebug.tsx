'use client';

import { useEffect, useState } from 'react';

export function ScrollDebug() {
  const [debug, setDebug] = useState({
    scrollY: 0,
    innerHeight: 0,
    documentHeight: 0,
    activeElement: '',
    lastFocusTime: '',
  });

  useEffect(() => {
    const updateDebug = () => {
      setDebug({
        scrollY: window.scrollY,
        innerHeight: window.innerHeight,
        documentHeight: document.documentElement.scrollHeight,
        activeElement: document.activeElement?.tagName || 'none',
        lastFocusTime: new Date().toLocaleTimeString(),
      });
    };

    const handleScroll = () => updateDebug();
    const handleFocus = () => updateDebug();
    const handleResize = () => updateDebug();

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    document.addEventListener('focusin', handleFocus);

    // Update inicial
    updateDebug();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('focusin', handleFocus);
    };
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-0 right-0 bg-black/80 text-white text-xs p-2 m-2 rounded font-mono z-[9999]">
      <div>ScrollY: {debug.scrollY}px</div>
      <div>Viewport: {debug.innerHeight}px</div>
      <div>Document: {debug.documentHeight}px</div>
      <div>Active: {debug.activeElement}</div>
      <div>Focus: {debug.lastFocusTime}</div>
    </div>
  );
}