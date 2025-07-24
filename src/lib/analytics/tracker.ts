// Core Analytics Tracker

import { 
  AnalyticsEvent, 
  UserProperties,
  PageViewEvent,
  CTAClickEvent,
  FormInteractionEvent,
  ConversionEvent,
  EngagementEvent,
  ExitIntentEvent,
  ErrorEvent,
  ScrollDepthEvent,
  TimeSegmentEvent,
  SupportChannelEvent
} from './types';
import { 
  analyticsConfig,
  GTM_CONFIG,
  GA4_CONFIG,
  CUSTOM_DIMENSIONS,
  SERVER_TRACKING_CONFIG,
  ENGAGEMENT_THRESHOLDS,
  ERROR_CONFIG
} from './config';
import {
  getOrCreateSession,
  getCookieConsent,
  sanitizeEventParams,
  isBot,
  EventBatcher,
  debounce,
  throttle,
  getScrollDepth,
  getTimeSegment,
  calculateEngagementScore,
  getPageSection
} from './utils';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

class AnalyticsTracker {
  private initialized = false;
  private session = getOrCreateSession();
  private eventBatcher: EventBatcher;
  private pageStartTime = Date.now();
  private scrollDepths = new Set<number>();
  private interactions = 0;
  private errorCount = 0;
  
  constructor() {
    this.eventBatcher = new EventBatcher(
      SERVER_TRACKING_CONFIG.batchSize,
      SERVER_TRACKING_CONFIG.batchTimeout,
      this.sendEventsToServer.bind(this)
    );
  }
  
  // Initialize analytics
  async initialize(): Promise<void> {
    if (this.initialized || typeof window === 'undefined') return;
    
    // Check if user is bot
    if (isBot()) {
      console.log('Analytics: Bot detected, tracking disabled');
      return;
    }
    
    // Check cookie consent
    const consent = getCookieConsent();
    if (!consent.analytics) {
      console.log('Analytics: No consent, tracking disabled');
      return;
    }
    
    // Initialize GTM
    this.initializeGTM();
    
    // Initialize GA4
    this.initializeGA4();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Set user properties
    this.setUserProperties(this.session.userProperties);
    
    this.initialized = true;
    
    // Track initial page view
    this.trackPageView();
  }
  
  // Initialize Google Tag Manager
  private initializeGTM(): void {
    if (!GTM_CONFIG.gtmId) return;
    
    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    
    // Add GTM script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_CONFIG.gtmId}`;
    
    script.onerror = () => {
      console.error('Failed to load GTM');
    };
    
    document.head.appendChild(script);
    
    // Add noscript fallback
    const noscript = document.createElement('noscript');
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${GTM_CONFIG.gtmId}`;
    iframe.height = '0';
    iframe.width = '0';
    iframe.style.display = 'none';
    iframe.style.visibility = 'hidden';
    noscript.appendChild(iframe);
    document.body.insertBefore(noscript, document.body.firstChild);
  }
  
  // Initialize Google Analytics 4
  private initializeGA4(): void {
    if (!GA4_CONFIG.measurementId) return;
    
    // Add gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_CONFIG.measurementId}`;
    document.head.appendChild(script);
    
    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
    
    window.gtag('js', new Date());
    window.gtag('config', GA4_CONFIG.measurementId, {
      send_page_view: GA4_CONFIG.sendPageView,
      anonymize_ip: GA4_CONFIG.anonymizeIp,
      cookie_flags: GA4_CONFIG.cookieFlags,
      cookie_domain: GA4_CONFIG.cookieDomain,
      cookie_expires: GA4_CONFIG.cookieExpires,
      cookie_prefix: GA4_CONFIG.cookiePrefix,
      transport_url: GA4_CONFIG.transportUrl,
      debug_mode: analyticsConfig.debug,
    });
  }
  
  // Set up event listeners
  private setupEventListeners(): void {
    // Scroll tracking
    const scrollHandler = throttle(() => {
      const depth = getScrollDepth();
      const thresholds = [25, 50, 75, 90, 100];
      
      thresholds.forEach(threshold => {
        if (depth >= threshold && !this.scrollDepths.has(threshold)) {
          this.scrollDepths.add(threshold);
          this.trackScrollDepth(threshold as any);
        }
      });
    }, 500);
    
    window.addEventListener('scroll', scrollHandler);
    
    // Exit intent tracking
    const exitIntentHandler = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        this.trackExitIntent();
      }
    };
    
    document.addEventListener('mouseout', exitIntentHandler);
    
    // Error tracking
    window.addEventListener('error', (event) => {
      if (this.errorCount < ERROR_CONFIG.maxErrorsPerSession) {
        this.trackError({
          error_type: 'javascript',
          error_message: event.message,
          error_stack: event.error?.stack,
        });
        this.errorCount++;
      }
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      if (this.errorCount < ERROR_CONFIG.maxErrorsPerSession) {
        this.trackError({
          error_type: 'javascript',
          error_message: event.reason?.message || String(event.reason),
          error_stack: event.reason?.stack,
        });
        this.errorCount++;
      }
    });
    
    // Time segment tracking
    const timeSegments = [10, 30, 60, 180, 300, 600]; // seconds
    timeSegments.forEach(seconds => {
      setTimeout(() => {
        if (document.hidden) return;
        this.trackTimeSegment(getTimeSegment(seconds));
      }, seconds * 1000);
    });
    
    // Page visibility tracking
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.eventBatcher.flush();
      }
    });
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      this.eventBatcher.flush();
    });
  }
  
  // Track event
  private track(event: AnalyticsEvent): void {
    if (!this.initialized) return;
    
    // Add to session
    this.session.events.push(event);
    this.interactions++;
    
    // Send to GTM
    if (window.dataLayer) {
      window.dataLayer.push({
        event: event.name,
        ...event.parameters,
        sessionId: this.session.sessionId,
        timestamp: event.timestamp || Date.now(),
      });
    }
    
    // Send to GA4
    if (window.gtag) {
      window.gtag('event', event.name, sanitizeEventParams({
        ...event.parameters,
        session_id: this.session.sessionId,
        engagement_time_msec: Date.now() - this.pageStartTime,
      }));
    }
    
    // Add to batch for server-side tracking
    if (analyticsConfig.serverSideTracking) {
      this.eventBatcher.add(event);
    }
    
    // Debug logging
    if (analyticsConfig.debug) {
      console.log('Analytics Event:', event);
    }
  }
  
  // Send events to server
  private async sendEventsToServer(events: AnalyticsEvent[]): Promise<void> {
    try {
      const response = await fetch(SERVER_TRACKING_CONFIG.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.session.sessionId,
          events,
          userProperties: this.session.userProperties,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Server tracking failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to send events to server:', error);
    }
  }
  
  // Public tracking methods
  
  trackPageView(customParams?: Partial<PageViewEvent['parameters']>): void {
    const timeOnPage = (Date.now() - this.pageStartTime) / 1000;
    
    this.track({
      name: 'page_view',
      parameters: {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname,
        page_referrer: document.referrer,
        scroll_depth: getScrollDepth(),
        time_on_page: timeOnPage,
        ...customParams,
      },
    });
    
    // Reset page metrics
    this.pageStartTime = Date.now();
    this.scrollDepths.clear();
    this.session.pageViews++;
  }
  
  trackCTAClick(params: CTAClickEvent['parameters']): void {
    this.track({
      name: 'cta_click',
      parameters: params,
    });
  }
  
  trackFormInteraction(params: FormInteractionEvent['parameters']): void {
    this.track({
      name: 'form_interaction',
      parameters: params,
    });
  }
  
  trackConversion(params: ConversionEvent['parameters']): void {
    this.track({
      name: 'conversion',
      parameters: params,
    });
  }
  
  trackEngagement(params: EngagementEvent['parameters']): void {
    this.track({
      name: 'engagement',
      parameters: params,
    });
  }
  
  trackSupportChannel(params: SupportChannelEvent['parameters']): void {
    this.track({
      name: 'support_channel',
      parameters: params,
    });
  }
  
  private trackScrollDepth(depth: ScrollDepthEvent['parameters']['depth_percentage']): void {
    const section = this.getCurrentSection();
    const timeToScroll = (Date.now() - this.pageStartTime) / 1000;
    
    this.track({
      name: 'scroll_depth',
      parameters: {
        depth_percentage: depth,
        page_section: section,
        time_to_scroll: timeToScroll,
      },
    });
  }
  
  private trackTimeSegment(segment: TimeSegmentEvent['parameters']['segment']): void {
    const engagementScore = calculateEngagementScore(
      (Date.now() - this.pageStartTime) / 1000,
      getScrollDepth(),
      this.interactions
    );
    
    this.track({
      name: 'time_segment',
      parameters: {
        segment,
        page_path: window.location.pathname,
        engagement_score: engagementScore,
      },
    });
  }
  
  private trackExitIntent(): void {
    const timeOnSite = (Date.now() - this.session.startTime) / 1000;
    
    this.track({
      name: 'exit_intent',
      parameters: {
        exit_page: window.location.pathname,
        time_on_site: timeOnSite,
        pages_viewed: this.session.pageViews,
        scroll_depth: getScrollDepth(),
      },
    });
  }
  
  private trackError(params: ErrorEvent['parameters']): void {
    // Filter out ignored errors
    if (ERROR_CONFIG.ignoreErrors.some(pattern => 
      params.error_message.includes(pattern)
    )) {
      return;
    }
    
    this.track({
      name: 'error',
      parameters: params,
    });
  }
  
  // Set user properties
  setUserProperties(properties: Partial<UserProperties>): void {
    this.session.userProperties = {
      ...this.session.userProperties,
      ...properties,
    };
    
    // Send to GA4
    if (window.gtag) {
      window.gtag('set', 'user_properties', {
        [CUSTOM_DIMENSIONS.userType]: properties.userType,
        [CUSTOM_DIMENSIONS.kycLevel]: properties.kycLevel,
        [CUSTOM_DIMENSIONS.preferredPaymentMethod]: properties.preferredPaymentMethod,
        [CUSTOM_DIMENSIONS.deviceCategory]: properties.deviceType,
      });
    }
  }
  
  // Get current page section
  private getCurrentSection(): string {
    const viewportHeight = window.innerHeight;
    const scrollTop = window.scrollY;
    const center = scrollTop + viewportHeight / 2;
    
    const sections = document.querySelectorAll('section');
    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      const top = rect.top + scrollTop;
      const bottom = top + rect.height;
      
      if (center >= top && center <= bottom) {
        return section.id || section.className.split(' ')[0] || 'unknown';
      }
    }
    
    return 'unknown';
  }
  
  // Get instance
  static instance: AnalyticsTracker | null = null;
  
  static getInstance(): AnalyticsTracker {
    if (!AnalyticsTracker.instance) {
      AnalyticsTracker.instance = new AnalyticsTracker();
    }
    return AnalyticsTracker.instance;
  }
}

// Export singleton instance
export const analytics = AnalyticsTracker.getInstance();