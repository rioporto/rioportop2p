// Analytics Types and Interfaces

export interface AnalyticsConfig {
  ga4MeasurementId: string;
  gtmContainerId: string;
  debug: boolean;
  cookieConsent: boolean;
  serverSideTracking: boolean;
}

export interface UserProperties {
  userId?: string;
  userType?: 'visitor' | 'registered' | 'verified' | 'active';
  kycLevel?: 0 | 1 | 2 | 3;
  registrationDate?: string;
  firstTransactionDate?: string;
  totalTransactions?: number;
  preferredPaymentMethod?: string;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
}

export interface EventProperties {
  [key: string]: any;
}

export interface CustomEvent {
  name: string;
  parameters?: EventProperties;
  timestamp?: number;
  sessionId?: string;
}

export interface PageViewEvent extends CustomEvent {
  name: 'page_view';
  parameters: {
    page_title: string;
    page_location: string;
    page_path: string;
    page_referrer?: string;
    scroll_depth?: number;
    time_on_page?: number;
  };
}

export interface CTAClickEvent extends CustomEvent {
  name: 'cta_click';
  parameters: {
    cta_text: string;
    cta_location: string;
    cta_type: 'primary' | 'secondary' | 'text';
    cta_destination: string;
    section: string;
    variant?: string;
  };
}

export interface FormInteractionEvent extends CustomEvent {
  name: 'form_interaction';
  parameters: {
    form_name: string;
    form_step?: number;
    interaction_type: 'start' | 'field_focus' | 'field_blur' | 'submit' | 'error' | 'abandon';
    field_name?: string;
    error_message?: string;
    time_to_complete?: number;
  };
}

export interface ConversionEvent extends CustomEvent {
  name: 'conversion';
  parameters: {
    conversion_type: 'registration_start' | 'registration_complete' | 'kyc_start' | 'kyc_complete' | 'first_transaction' | 'course_enrollment';
    conversion_value?: number;
    currency?: string;
    kyc_level?: number;
    payment_method?: string;
  };
}

export interface EngagementEvent extends CustomEvent {
  name: 'engagement';
  parameters: {
    engagement_type: 'video_play' | 'video_complete' | 'content_expand' | 'faq_interaction' | 'testimonial_view' | 'chat_open';
    content_id?: string;
    content_title?: string;
    duration?: number;
    percentage_viewed?: number;
  };
}

export interface ExitIntentEvent extends CustomEvent {
  name: 'exit_intent';
  parameters: {
    exit_page: string;
    time_on_site: number;
    pages_viewed: number;
    last_interaction?: string;
    scroll_depth: number;
  };
}

export interface ErrorEvent extends CustomEvent {
  name: 'error';
  parameters: {
    error_type: 'javascript' | 'api' | 'form_validation' | 'payment';
    error_message: string;
    error_code?: string;
    error_stack?: string;
    user_action?: string;
  };
}

export interface ScrollDepthEvent extends CustomEvent {
  name: 'scroll_depth';
  parameters: {
    depth_percentage: 25 | 50 | 75 | 90 | 100;
    page_section?: string;
    time_to_scroll?: number;
  };
}

export interface TimeSegmentEvent extends CustomEvent {
  name: 'time_segment';
  parameters: {
    segment: '0-10s' | '10-30s' | '30-60s' | '1-3m' | '3-5m' | '5-10m' | '10m+';
    page_path: string;
    engagement_score: number;
  };
}

export interface SupportChannelEvent extends CustomEvent {
  name: 'support_channel';
  parameters: {
    channel: 'chat' | 'email' | 'whatsapp' | 'faq' | 'help_center';
    action: 'open' | 'message_sent' | 'close';
    topic?: string;
    resolution?: 'resolved' | 'escalated' | 'abandoned';
  };
}

export type AnalyticsEvent = 
  | PageViewEvent
  | CTAClickEvent
  | FormInteractionEvent
  | ConversionEvent
  | EngagementEvent
  | ExitIntentEvent
  | ErrorEvent
  | ScrollDepthEvent
  | TimeSegmentEvent
  | SupportChannelEvent;

export interface AnalyticsSession {
  sessionId: string;
  startTime: number;
  lastActivity: number;
  pageViews: number;
  events: AnalyticsEvent[];
  userProperties: UserProperties;
  source?: string;
  medium?: string;
  campaign?: string;
}

export interface ConversionFunnel {
  visit: number;
  engage: number;
  register: number;
  kyc: number;
  firstTransaction: number;
}

export interface AnalyticsReport {
  period: 'realtime' | 'today' | 'week' | 'month';
  visitors: number;
  pageViews: number;
  avgTimeOnSite: number;
  bounceRate: number;
  conversionRate: number;
  funnel: ConversionFunnel;
  topContent: Array<{
    path: string;
    views: number;
    avgTime: number;
    conversionRate: number;
  }>;
  topCTAs: Array<{
    text: string;
    clicks: number;
    conversionRate: number;
  }>;
  userFlow: Array<{
    from: string;
    to: string;
    count: number;
  }>;
}

export interface CookieConsent {
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  timestamp: number;
}