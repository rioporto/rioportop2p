'use client';

import { useCallback, useEffect, useRef } from 'react';
import { analytics } from './tracker';
import {
  CTAClickEvent,
  FormInteractionEvent,
  ConversionEvent,
  EngagementEvent,
  SupportChannelEvent,
} from './types';
import { debounce } from './utils';

export interface UseAnalyticsReturn {
  trackCTAClick: (params: CTAClickEvent['parameters']) => void;
  trackFormInteraction: (params: FormInteractionEvent['parameters']) => void;
  trackConversion: (params: ConversionEvent['parameters']) => void;
  trackEngagement: (params: EngagementEvent['parameters']) => void;
  trackSupportChannel: (params: SupportChannelEvent['parameters']) => void;
  trackFormStart: (formName: string) => void;
  trackFormSubmit: (formName: string, success: boolean, error?: string) => void;
  trackFormFieldInteraction: (formName: string, fieldName: string, interactionType: 'focus' | 'blur') => void;
  trackVideoEngagement: (videoId: string, action: 'play' | 'pause' | 'complete', duration?: number) => void;
  trackContentExpand: (contentId: string, contentTitle: string) => void;
  trackFAQInteraction: (question: string) => void;
}

export function useAnalytics(): UseAnalyticsReturn {
  const formStartTimes = useRef<Record<string, number>>({});
  
  // Track CTA clicks
  const trackCTAClick = useCallback((params: CTAClickEvent['parameters']) => {
    analytics.trackCTAClick(params);
  }, []);
  
  // Track form interactions
  const trackFormInteraction = useCallback((params: FormInteractionEvent['parameters']) => {
    analytics.trackFormInteraction(params);
  }, []);
  
  // Track conversions
  const trackConversion = useCallback((params: ConversionEvent['parameters']) => {
    analytics.trackConversion(params);
  }, []);
  
  // Track engagement
  const trackEngagement = useCallback((params: EngagementEvent['parameters']) => {
    analytics.trackEngagement(params);
  }, []);
  
  // Track support channel
  const trackSupportChannel = useCallback((params: SupportChannelEvent['parameters']) => {
    analytics.trackSupportChannel(params);
  }, []);
  
  // Convenience methods for common tracking scenarios
  
  // Track form start
  const trackFormStart = useCallback((formName: string) => {
    formStartTimes.current[formName] = Date.now();
    trackFormInteraction({
      form_name: formName,
      interaction_type: 'start',
    });
  }, [trackFormInteraction]);
  
  // Track form submit
  const trackFormSubmit = useCallback((formName: string, success: boolean, error?: string) => {
    const startTime = formStartTimes.current[formName];
    const timeToComplete = startTime ? (Date.now() - startTime) / 1000 : undefined;
    
    trackFormInteraction({
      form_name: formName,
      interaction_type: success ? 'submit' : 'error',
      error_message: error,
      time_to_complete: timeToComplete,
    });
    
    // Clean up
    delete formStartTimes.current[formName];
  }, [trackFormInteraction]);
  
  // Track form field interaction
  const trackFormFieldInteraction = useCallback(
    debounce((formName: string, fieldName: string, interactionType: 'focus' | 'blur') => {
      trackFormInteraction({
        form_name: formName,
        interaction_type: `field_${interactionType}`,
        field_name: fieldName,
      });
    }, 500),
    [trackFormInteraction]
  );
  
  // Track video engagement
  const trackVideoEngagement = useCallback(
    (videoId: string, action: 'play' | 'pause' | 'complete', duration?: number) => {
      const engagementType = action === 'play' ? 'video_play' : 
                            action === 'complete' ? 'video_complete' : 
                            'engagement';
      
      trackEngagement({
        engagement_type: engagementType as any,
        content_id: videoId,
        duration,
      });
    },
    [trackEngagement]
  );
  
  // Track content expand
  const trackContentExpand = useCallback(
    (contentId: string, contentTitle: string) => {
      trackEngagement({
        engagement_type: 'content_expand',
        content_id: contentId,
        content_title: contentTitle,
      });
    },
    [trackEngagement]
  );
  
  // Track FAQ interaction
  const trackFAQInteraction = useCallback(
    (question: string) => {
      trackEngagement({
        engagement_type: 'faq_interaction',
        content_title: question,
      });
    },
    [trackEngagement]
  );
  
  return {
    trackCTAClick,
    trackFormInteraction,
    trackConversion,
    trackEngagement,
    trackSupportChannel,
    trackFormStart,
    trackFormSubmit,
    trackFormFieldInteraction,
    trackVideoEngagement,
    trackContentExpand,
    trackFAQInteraction,
  };
}

// Hook for tracking element visibility
export function useTrackVisibility(
  elementRef: React.RefObject<HTMLElement>,
  onVisible: () => void,
  options?: IntersectionObserverInit
) {
  const hasBeenVisible = useRef(false);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element || hasBeenVisible.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasBeenVisible.current) {
            hasBeenVisible.current = true;
            onVisible();
            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.5,
        ...options,
      }
    );
    
    observer.observe(element);
    
    return () => {
      observer.disconnect();
    };
  }, [elementRef, onVisible, options]);
}

// Hook for tracking time spent on component
export function useTrackTimeSpent(
  componentName: string,
  threshold: number = 5000 // 5 seconds
) {
  const startTime = useRef<number>(Date.now());
  const tracked = useRef(false);
  
  useEffect(() => {
    const checkTime = () => {
      if (!tracked.current && Date.now() - startTime.current >= threshold) {
        tracked.current = true;
        analytics.trackEngagement({
          engagement_type: 'content_expand',
          content_id: componentName,
          duration: threshold / 1000,
        });
      }
    };
    
    const interval = setInterval(checkTime, 1000);
    
    return () => {
      clearInterval(interval);
      if (!tracked.current) {
        const timeSpent = Date.now() - startTime.current;
        if (timeSpent >= threshold) {
          analytics.trackEngagement({
            engagement_type: 'content_expand',
            content_id: componentName,
            duration: timeSpent / 1000,
          });
        }
      }
    };
  }, [componentName, threshold]);
}