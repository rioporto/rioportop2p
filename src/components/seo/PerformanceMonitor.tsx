'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export function PerformanceMonitor() {
  useEffect(() => {
    // Web Vitals monitoring
    if ('web-vital' in window) {
      // Monitor Core Web Vitals
      const reportWebVital = ({ name, value, id }: any) => {
        // Send to Google Analytics
        if (window.gtag) {
          window.gtag('event', name, {
            event_category: 'Web Vitals',
            event_label: id,
            value: Math.round(name === 'CLS' ? value * 1000 : value),
            non_interaction: true,
          });
        }

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Web Vital] ${name}:`, value);
        }
      };

      // Report all web vitals
      ['FCP', 'LCP', 'CLS', 'FID', 'TTFB'].forEach((vital) => {
        try {
          // @ts-ignore
          window.web-vital?.[vital]?.(reportWebVital);
        } catch (error) {
          console.error(`Failed to track ${vital}:`, error);
        }
      });
    }

    // Performance Observer for resource timing
    if ('PerformanceObserver' in window) {
      try {
        // Monitor long tasks
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              console.warn('[Long Task]', {
                duration: entry.duration,
                startTime: entry.startTime,
              });
            }
          }
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });

        // Monitor largest contentful paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          console.log('[LCP]', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // Monitor layout shifts
        const clsObserver = new PerformanceObserver((list) => {
          let clsScore = 0;
          for (const entry of list.getEntries()) {
            // @ts-ignore
            if (!entry.hadRecentInput) {
              // @ts-ignore
              clsScore += entry.value;
            }
          }
          console.log('[CLS Score]', clsScore);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        // Cleanup
        return () => {
          longTaskObserver.disconnect();
          lcpObserver.disconnect();
          clsObserver.disconnect();
        };
      } catch (error) {
        console.error('Failed to setup performance observers:', error);
      }
    }

    // Report page load metrics
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          const metrics = {
            dns: navigation.domainLookupEnd - navigation.domainLookupStart,
            tcp: navigation.connectEnd - navigation.connectStart,
            ttfb: navigation.responseStart - navigation.requestStart,
            download: navigation.responseEnd - navigation.responseStart,
            domInteractive: navigation.domInteractive - navigation.fetchStart,
            domComplete: navigation.domComplete - navigation.fetchStart,
            loadComplete: navigation.loadEventEnd - navigation.fetchStart,
          };

          console.log('[Page Load Metrics]', metrics);

          // Send critical metrics to analytics
          if (window.gtag) {
            window.gtag('event', 'page_load_time', {
              event_category: 'Performance',
              value: Math.round(metrics.loadComplete),
              event_label: window.location.pathname,
            });
          }
        }
      }, 0);
    });
  }, []);

  return null;
}