'use client';

import React, { useEffect, useRef } from 'react';
import { useAnalytics, useTrackVisibility } from './useAnalytics';
import { analytics } from './tracker';

interface EventTrackerProps {
  children: React.ReactNode;
  eventType: 'cta' | 'form' | 'engagement' | 'visibility';
  eventParams?: Record<string, any>;
  onClick?: () => void;
  onVisible?: () => void;
  visibilityThreshold?: number;
  className?: string;
}

export function EventTracker({
  children,
  eventType,
  eventParams = {},
  onClick,
  onVisible,
  visibilityThreshold = 0.5,
  className,
}: EventTrackerProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const { trackCTAClick, trackEngagement } = useAnalytics();
  
  // Track visibility
  useTrackVisibility(
    elementRef,
    () => {
      if (eventType === 'visibility' && onVisible) {
        onVisible();
      }
      if (eventType === 'engagement') {
        trackEngagement({
          engagement_type: 'content_expand',
          ...eventParams,
        });
      }
    },
    { threshold: visibilityThreshold }
  );
  
  // Handle click tracking
  const handleClick = (e: React.MouseEvent) => {
    if (eventType === 'cta') {
      const target = e.currentTarget as HTMLElement;
      const section = target.closest('section');
      
      trackCTAClick({
        cta_text: target.textContent || '',
        cta_location: window.location.pathname,
        cta_type: eventParams.cta_type || 'primary',
        cta_destination: eventParams.cta_destination || '#',
        section: section?.id || section?.className.split(' ')[0] || 'unknown',
        ...eventParams,
      });
    }
    
    if (onClick) {
      onClick();
    }
  };
  
  return (
    <div
      ref={elementRef}
      className={className}
      onClick={eventType === 'cta' ? handleClick : undefined}
    >
      {children}
    </div>
  );
}

// Specialized CTA Tracker
interface CTATrackerProps {
  children: React.ReactNode;
  ctaText: string;
  ctaDestination: string;
  ctaType?: 'primary' | 'secondary' | 'text';
  variant?: string;
  className?: string;
  onClick?: () => void;
}

export function CTATracker({
  children,
  ctaText,
  ctaDestination,
  ctaType = 'primary',
  variant,
  className,
  onClick,
}: CTATrackerProps) {
  return (
    <EventTracker
      eventType="cta"
      eventParams={{
        cta_text: ctaText,
        cta_destination: ctaDestination,
        cta_type: ctaType,
        variant,
      }}
      className={className}
      onClick={onClick}
    >
      {children}
    </EventTracker>
  );
}

// Form Tracker
interface FormTrackerProps {
  children: React.ReactNode;
  formName: string;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
}

export function FormTracker({
  children,
  formName,
  onSubmit,
  className,
}: FormTrackerProps) {
  const { trackFormStart, trackFormSubmit, trackFormFieldInteraction } = useAnalytics();
  const startTimeRef = useRef<number>(0);
  
  useEffect(() => {
    startTimeRef.current = Date.now();
    trackFormStart(formName);
  }, [formName, trackFormStart]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (onSubmit) {
        onSubmit(e);
      }
      trackFormSubmit(formName, true);
    } catch (error) {
      trackFormSubmit(formName, false, error instanceof Error ? error.message : 'Unknown error');
    }
  };
  
  const handleFieldInteraction = (fieldName: string, interactionType: 'focus' | 'blur') => {
    trackFormFieldInteraction(formName, fieldName, interactionType);
  };
  
  // Clone children and inject tracking props
  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      // If it's an input, textarea, or select, add tracking
      if (
        child.type === 'input' ||
        child.type === 'textarea' ||
        child.type === 'select' ||
        child.props.type === 'input' ||
        child.props.type === 'textarea' ||
        child.props.type === 'select'
      ) {
        return React.cloneElement(child, {
          onFocus: (e: React.FocusEvent) => {
            handleFieldInteraction(child.props.name || 'unknown', 'focus');
            if (child.props.onFocus) {
              child.props.onFocus(e);
            }
          },
          onBlur: (e: React.FocusEvent) => {
            handleFieldInteraction(child.props.name || 'unknown', 'blur');
            if (child.props.onBlur) {
              child.props.onBlur(e);
            }
          },
        } as any);
      }
    }
    return child;
  });
  
  return (
    <form onSubmit={handleSubmit} className={className}>
      {enhancedChildren}
    </form>
  );
}

// Section Tracker for automatic section visibility tracking
interface SectionTrackerProps {
  children: React.ReactNode;
  sectionName: string;
  className?: string;
}

export function SectionTracker({
  children,
  sectionName,
  className,
}: SectionTrackerProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { trackEngagement } = useAnalytics();
  
  useTrackVisibility(
    sectionRef,
    () => {
      trackEngagement({
        engagement_type: 'content_expand',
        content_id: `section_${sectionName}`,
        content_title: sectionName,
      });
    },
    { threshold: 0.5 }
  );
  
  return (
    <section ref={sectionRef} id={sectionName} className={className}>
      {children}
    </section>
  );
}

// Video Tracker
interface VideoTrackerProps {
  children: React.ReactNode;
  videoId: string;
  videoTitle: string;
  className?: string;
}

export function VideoTracker({
  children,
  videoId,
  videoTitle,
  className,
}: VideoTrackerProps) {
  const { trackVideoEngagement } = useAnalytics();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handlePlay = () => trackVideoEngagement(videoId, 'play');
    const handlePause = () => trackVideoEngagement(videoId, 'pause');
    const handleEnded = () => trackVideoEngagement(videoId, 'complete', video.duration);
    
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    
    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [videoId, trackVideoEngagement]);
  
  // Clone video element and add ref
  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.type === 'video') {
      return React.cloneElement(child, { ref: videoRef } as any);
    }
    return child;
  });
  
  return <div className={className}>{enhancedChildren}</div>;
}