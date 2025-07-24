// Analytics Configuration

import { AnalyticsConfig } from './types';

export const analyticsConfig: AnalyticsConfig = {
  ga4MeasurementId: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || '',
  gtmContainerId: process.env.NEXT_PUBLIC_GTM_CONTAINER_ID || '',
  debug: process.env.NODE_ENV === 'development',
  cookieConsent: true,
  serverSideTracking: true,
};

// GTM Configuration
export const GTM_CONFIG = {
  gtmId: analyticsConfig.gtmContainerId,
  dataLayerName: 'dataLayer',
  events: {
    pageView: 'page_view',
    ctaClick: 'cta_click',
    formInteraction: 'form_interaction',
    conversion: 'conversion',
    engagement: 'engagement',
    exitIntent: 'exit_intent',
    error: 'error',
    scrollDepth: 'scroll_depth',
    timeSegment: 'time_segment',
    supportChannel: 'support_channel',
  },
};

// GA4 Configuration
export const GA4_CONFIG = {
  measurementId: analyticsConfig.ga4MeasurementId,
  anonymizeIp: true,
  cookieFlags: 'SameSite=None; Secure',
  cookieDomain: 'auto',
  cookieExpires: 63072000, // 2 years
  cookiePrefix: 'rio_porto_',
  sendPageView: false, // We'll send custom page views
  transportUrl: 'https://www.google-analytics.com',
};

// Custom Dimensions and Metrics
export const CUSTOM_DIMENSIONS = {
  userType: 'dimension1',
  kycLevel: 'dimension2',
  preferredPaymentMethod: 'dimension3',
  deviceCategory: 'dimension4',
  sessionEngagement: 'dimension5',
};

export const CUSTOM_METRICS = {
  scrollDepth: 'metric1',
  timeOnPage: 'metric2',
  engagementScore: 'metric3',
  formCompletionTime: 'metric4',
};

// Event Parameters Limits (GA4)
export const GA4_LIMITS = {
  eventNameLength: 40,
  parameterNameLength: 40,
  parameterValueLength: 100,
  parametersPerEvent: 25,
  userPropertyNameLength: 24,
  userPropertyValueLength: 36,
  userPropertiesCount: 25,
};

// Default User Properties
export const DEFAULT_USER_PROPERTIES = {
  userType: 'visitor',
  kycLevel: 0,
  deviceType: 'desktop',
};

// Session Configuration
export const SESSION_CONFIG = {
  timeout: 30 * 60 * 1000, // 30 minutes
  storageKey: 'rio_porto_session',
  cookieName: 'rio_porto_session_id',
};

// Privacy Configuration (LGPD Compliant)
export const PRIVACY_CONFIG = {
  cookieConsentKey: 'rio_porto_cookie_consent',
  cookieConsentExpiry: 365 * 24 * 60 * 60 * 1000, // 1 year
  defaultConsent: {
    analytics: false,
    marketing: false,
    functional: true,
  },
  requiredCookies: [
    'rio_porto_session_id',
    'rio_porto_user_id',
  ],
  analyticsCookies: [
    '_ga',
    '_ga_*',
    '_gid',
    '_gtm_*',
  ],
  marketingCookies: [
    '_fbp',
    '_gcl_*',
  ],
};

// Server-side Tracking Endpoint
export const SERVER_TRACKING_CONFIG = {
  endpoint: '/api/analytics/track',
  batchSize: 10,
  batchTimeout: 5000, // 5 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
};

// Content Engagement Thresholds
export const ENGAGEMENT_THRESHOLDS = {
  minScrollDepth: 25,
  minTimeOnPage: 5, // seconds
  significantScroll: 50,
  highEngagementTime: 60, // seconds
  videoWatchPercentage: 75,
};

// Conversion Values (in BRL)
export const CONVERSION_VALUES = {
  registration_start: 0,
  registration_complete: 50,
  kyc_start: 100,
  kyc_complete: 200,
  first_transaction: 500,
  course_enrollment: 150,
};

// Error Tracking Configuration
export const ERROR_CONFIG = {
  sampleRate: 1.0, // 100% in production
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
  ],
  maxErrorsPerSession: 10,
};