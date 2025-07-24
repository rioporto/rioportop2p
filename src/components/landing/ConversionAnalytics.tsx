"use client";

import React, { useEffect, useRef } from "react";

interface IConversionEvent {
  eventName: string;
  eventData?: Record<string, any>;
}

interface IConversionAnalyticsProps {
  /** Google Analytics measurement ID */
  measurementId?: string;
  /** Enable debug mode */
  debug?: boolean;
  /** Custom conversion events to track */
  customEvents?: IConversionEvent[];
}

// Global analytics helper
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const ConversionAnalytics: React.FC<IConversionAnalyticsProps> = ({
  measurementId,
  debug = false,
  customEvents = [],
}) => {
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // Initialize analytics
    if (typeof window !== "undefined" && measurementId) {
      // Load Google Analytics
      const script = document.createElement("script");
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      script.async = true;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function() {
        window.dataLayer?.push(arguments);
      };
      window.gtag("js", new Date());
      window.gtag("config", measurementId, {
        debug_mode: debug,
      });

      // Track page view
      trackPageView();
    }

    // Set up scroll tracking
    setupScrollTracking();

    // Set up visibility tracking
    setupVisibilityTracking();

    // Set up engagement tracking
    setupEngagementTracking();

    // Track custom events
    customEvents.forEach(event => {
      trackEvent(event.eventName, event.eventData);
    });
  }, [measurementId, debug, customEvents]);

  return null; // This component doesn't render anything
};

// Track page views
export const trackPageView = (pagePath?: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "page_view", {
      page_path: pagePath || window.location.pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }
};

// Track custom events
export const trackEvent = (eventName: string, eventData?: Record<string, any>) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, {
      ...eventData,
      timestamp: new Date().toISOString(),
    });
  }
};

// Track CTA clicks
export const trackCTAClick = (ctaId: string, ctaText: string, ctaLocation: string) => {
  trackEvent("cta_click", {
    cta_id: ctaId,
    cta_text: ctaText,
    cta_location: ctaLocation,
    page_path: window.location.pathname,
  });
};

// Track form interactions
export const trackFormInteraction = (formId: string, action: "start" | "abandon" | "complete", fieldName?: string) => {
  trackEvent(`form_${action}`, {
    form_id: formId,
    field_name: fieldName,
    page_path: window.location.pathname,
  });
};

// Track conversion funnel
export const trackFunnelStep = (funnelName: string, step: number, stepName: string) => {
  trackEvent("funnel_step", {
    funnel_name: funnelName,
    step_number: step,
    step_name: stepName,
  });
};

// Set up scroll depth tracking
const setupScrollTracking = () => {
  if (typeof window === "undefined") return;

  const scrollDepths = [25, 50, 75, 90, 100];
  const trackedDepths = new Set<number>();

  const handleScroll = () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollPercentage = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);

    scrollDepths.forEach(depth => {
      if (scrollPercentage >= depth && !trackedDepths.has(depth)) {
        trackedDepths.add(depth);
        trackEvent("scroll_depth", {
          percent_scrolled: depth,
          page_path: window.location.pathname,
        });
      }
    });
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
};

// Set up visibility tracking
const setupVisibilityTracking = () => {
  if (typeof document === "undefined") return;

  let hiddenTime = 0;
  let visibleTime = 0;
  let lastVisibilityChange = Date.now();

  const handleVisibilityChange = () => {
    const now = Date.now();
    const duration = now - lastVisibilityChange;

    if (document.hidden) {
      visibleTime += duration;
      trackEvent("page_visibility_change", {
        state: "hidden",
        visible_duration_ms: duration,
        total_visible_time_ms: visibleTime,
      });
    } else {
      hiddenTime += duration;
      trackEvent("page_visibility_change", {
        state: "visible",
        hidden_duration_ms: duration,
        total_hidden_time_ms: hiddenTime,
      });
    }

    lastVisibilityChange = now;
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
};

// Set up engagement tracking
const setupEngagementTracking = () => {
  if (typeof window === "undefined") return;

  let engagementTime = 0;
  let lastEngagement = Date.now();
  let isEngaged = true;
  let engagementTimer: NodeJS.Timeout;

  const resetEngagement = () => {
    if (!isEngaged) {
      isEngaged = true;
      lastEngagement = Date.now();
    }

    clearTimeout(engagementTimer);
    engagementTimer = setTimeout(() => {
      if (isEngaged) {
        isEngaged = false;
        engagementTime += Date.now() - lastEngagement;
        
        trackEvent("engagement_milestone", {
          total_engaged_time_seconds: Math.round(engagementTime / 1000),
          page_path: window.location.pathname,
        });
      }
    }, 30000); // Consider user disengaged after 30 seconds of inactivity
  };

  // Track various engagement signals
  ["mousedown", "keydown", "scroll", "touchstart"].forEach(event => {
    window.addEventListener(event, resetEngagement, { passive: true });
  });

  resetEngagement();
};

// Conversion tracking hook
export const useConversionTracking = (conversionName: string) => {
  const startTime = useRef(Date.now());
  const interactionCount = useRef(0);

  const trackInteraction = (interactionType: string) => {
    interactionCount.current++;
    trackEvent(`${conversionName}_interaction`, {
      interaction_type: interactionType,
      interaction_count: interactionCount.current,
      time_since_start_ms: Date.now() - startTime.current,
    });
  };

  const trackConversion = (conversionData?: Record<string, any>) => {
    const totalTime = Date.now() - startTime.current;
    
    trackEvent(`${conversionName}_conversion`, {
      ...conversionData,
      total_time_ms: totalTime,
      total_interactions: interactionCount.current,
      average_time_per_interaction: totalTime / interactionCount.current,
    });
  };

  return { trackInteraction, trackConversion };
};

// A/B test tracking hook
export const useABTest = (testName: string, variants: string[]) => {
  const [selectedVariant, setSelectedVariant] = React.useState<string>("");

  useEffect(() => {
    // Simple variant selection based on timestamp
    const variantIndex = new Date().getTime() % variants.length;
    const variant = variants[variantIndex];
    setSelectedVariant(variant);

    // Track variant assignment
    trackEvent("ab_test_assignment", {
      test_name: testName,
      variant: variant,
      total_variants: variants.length,
    });
  }, [testName, variants]);

  const trackVariantInteraction = (interactionType: string) => {
    trackEvent("ab_test_interaction", {
      test_name: testName,
      variant: selectedVariant,
      interaction_type: interactionType,
    });
  };

  const trackVariantConversion = (conversionValue?: number) => {
    trackEvent("ab_test_conversion", {
      test_name: testName,
      variant: selectedVariant,
      conversion_value: conversionValue,
    });
  };

  return {
    variant: selectedVariant,
    trackInteraction: trackVariantInteraction,
    trackConversion: trackVariantConversion,
  };
};

// Heatmap tracking component
export const HeatmapTracking: React.FC<{
  enabled?: boolean;
}> = ({ enabled = true }) => {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const trackClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const rect = target.getBoundingClientRect();
      
      trackEvent("heatmap_click", {
        element_tag: target.tagName,
        element_text: target.textContent?.slice(0, 50),
        element_class: target.className,
        x_position: event.clientX,
        y_position: event.clientY,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
        relative_x: (event.clientX - rect.left) / rect.width,
        relative_y: (event.clientY - rect.top) / rect.height,
      });
    };

    document.addEventListener("click", trackClick);
    return () => document.removeEventListener("click", trackClick);
  }, [enabled]);

  return null;
};