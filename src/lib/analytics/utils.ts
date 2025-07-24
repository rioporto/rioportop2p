// Analytics Utilities

import crypto from 'crypto';
import { 
  AnalyticsEvent, 
  UserProperties, 
  CookieConsent,
  AnalyticsSession
} from './types';
import { 
  SESSION_CONFIG, 
  PRIVACY_CONFIG, 
  GA4_LIMITS,
  DEFAULT_USER_PROPERTIES 
} from './config';

// Generate unique session ID
export function generateSessionId(): string {
  return crypto.randomUUID();
}

// Get or create session
export function getOrCreateSession(): AnalyticsSession {
  if (typeof window === 'undefined') return createNewSession();
  
  const stored = localStorage.getItem(SESSION_CONFIG.storageKey);
  if (stored) {
    try {
      const session = JSON.parse(stored) as AnalyticsSession;
      const now = Date.now();
      
      // Check if session is still valid
      if (now - session.lastActivity < SESSION_CONFIG.timeout) {
        session.lastActivity = now;
        saveSession(session);
        return session;
      }
    } catch (e) {
      console.error('Failed to parse session:', e);
    }
  }
  
  return createNewSession();
}

// Create new session
function createNewSession(): AnalyticsSession {
  const session: AnalyticsSession = {
    sessionId: generateSessionId(),
    startTime: Date.now(),
    lastActivity: Date.now(),
    pageViews: 0,
    events: [],
    userProperties: { ...DEFAULT_USER_PROPERTIES },
    source: getUtmSource(),
    medium: getUtmMedium(),
    campaign: getUtmCampaign(),
  };
  
  saveSession(session);
  return session;
}

// Save session
function saveSession(session: AnalyticsSession): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_CONFIG.storageKey, JSON.stringify(session));
    
    // Also set session cookie
    document.cookie = `${SESSION_CONFIG.cookieName}=${session.sessionId}; path=/; max-age=${SESSION_CONFIG.timeout / 1000}; SameSite=Lax; Secure`;
  }
}

// Get UTM parameters
function getUtmSource(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const params = new URLSearchParams(window.location.search);
  return params.get('utm_source') || undefined;
}

function getUtmMedium(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const params = new URLSearchParams(window.location.search);
  return params.get('utm_medium') || undefined;
}

function getUtmCampaign(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const params = new URLSearchParams(window.location.search);
  return params.get('utm_campaign') || undefined;
}

// Cookie consent management
export function getCookieConsent(): CookieConsent {
  if (typeof window === 'undefined') {
    return PRIVACY_CONFIG.defaultConsent;
  }
  
  const stored = localStorage.getItem(PRIVACY_CONFIG.cookieConsentKey);
  if (stored) {
    try {
      return JSON.parse(stored) as CookieConsent;
    } catch (e) {
      console.error('Failed to parse cookie consent:', e);
    }
  }
  
  return PRIVACY_CONFIG.defaultConsent;
}

export function setCookieConsent(consent: Partial<CookieConsent>): void {
  if (typeof window === 'undefined') return;
  
  const current = getCookieConsent();
  const updated: CookieConsent = {
    ...current,
    ...consent,
    timestamp: Date.now(),
  };
  
  localStorage.setItem(PRIVACY_CONFIG.cookieConsentKey, JSON.stringify(updated));
  
  // Apply consent changes
  if (!updated.analytics) {
    removeAnalyticsCookies();
  }
  if (!updated.marketing) {
    removeMarketingCookies();
  }
}

// Remove analytics cookies
function removeAnalyticsCookies(): void {
  if (typeof window === 'undefined') return;
  
  PRIVACY_CONFIG.analyticsCookies.forEach(cookiePattern => {
    if (cookiePattern.includes('*')) {
      // Handle wildcard patterns
      const prefix = cookiePattern.replace('*', '');
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=');
        if (name.startsWith(prefix)) {
          deleteCookie(name);
        }
      });
    } else {
      deleteCookie(cookiePattern);
    }
  });
}

// Remove marketing cookies
function removeMarketingCookies(): void {
  if (typeof window === 'undefined') return;
  
  PRIVACY_CONFIG.marketingCookies.forEach(cookiePattern => {
    if (cookiePattern.includes('*')) {
      const prefix = cookiePattern.replace('*', '');
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=');
        if (name.startsWith(prefix)) {
          deleteCookie(name);
        }
      });
    } else {
      deleteCookie(cookiePattern);
    }
  });
}

// Delete cookie
function deleteCookie(name: string): void {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  document.cookie = `${name}=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

// Sanitize event parameters for GA4
export function sanitizeEventParams(params: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  const entries = Object.entries(params).slice(0, GA4_LIMITS.parametersPerEvent);
  
  entries.forEach(([key, value]) => {
    // Sanitize parameter name
    const sanitizedKey = key
      .slice(0, GA4_LIMITS.parameterNameLength)
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/^_+|_+$/g, '');
    
    // Sanitize parameter value
    let sanitizedValue = value;
    if (typeof value === 'string') {
      sanitizedValue = value.slice(0, GA4_LIMITS.parameterValueLength);
    } else if (typeof value === 'number') {
      sanitizedValue = isFinite(value) ? value : 0;
    } else if (typeof value === 'boolean') {
      sanitizedValue = value;
    } else {
      sanitizedValue = String(value).slice(0, GA4_LIMITS.parameterValueLength);
    }
    
    if (sanitizedKey) {
      sanitized[sanitizedKey] = sanitizedValue;
    }
  });
  
  return sanitized;
}

// Get device type
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  const userAgent = window.navigator.userAgent.toLowerCase();
  
  if (/mobile|android|iphone|ipod/.test(userAgent) && width < 768) {
    return 'mobile';
  } else if (/ipad|tablet/.test(userAgent) || (width >= 768 && width < 1024)) {
    return 'tablet';
  }
  
  return 'desktop';
}

// Calculate scroll depth
export function getScrollDepth(): number {
  if (typeof window === 'undefined') return 0;
  
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrolled = window.scrollY;
  
  if (scrollHeight <= 0) return 100;
  
  return Math.min(100, Math.round((scrolled / scrollHeight) * 100));
}

// Calculate engagement score
export function calculateEngagementScore(
  timeOnPage: number,
  scrollDepth: number,
  interactions: number
): number {
  // Weighted score: Time (40%), Scroll (30%), Interactions (30%)
  const timeScore = Math.min(100, (timeOnPage / 300) * 100); // 5 minutes = 100%
  const scrollScore = scrollDepth;
  const interactionScore = Math.min(100, interactions * 10); // 10 interactions = 100%
  
  return Math.round(
    (timeScore * 0.4) + 
    (scrollScore * 0.3) + 
    (interactionScore * 0.3)
  );
}

// Format time duration
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
}

// Get time segment
export function getTimeSegment(seconds: number): string {
  if (seconds < 10) return '0-10s';
  if (seconds < 30) return '10-30s';
  if (seconds < 60) return '30-60s';
  if (seconds < 180) return '1-3m';
  if (seconds < 300) return '3-5m';
  if (seconds < 600) return '5-10m';
  return '10m+';
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Check if user is bot
export function isBot(): boolean {
  if (typeof window === 'undefined') return false;
  
  const botPatterns = [
    'bot', 'crawler', 'spider', 'scraper', 'lighthouse',
    'gtmetrix', 'pingdom', 'monitor', 'uptime'
  ];
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  return botPatterns.some(pattern => userAgent.includes(pattern));
}

// Get page section from element
export function getPageSection(element: Element): string {
  const section = element.closest('section');
  if (section) {
    return section.id || section.className.split(' ')[0] || 'unknown';
  }
  return 'unknown';
}

// Batch events for server-side tracking
export class EventBatcher {
  private queue: AnalyticsEvent[] = [];
  private timer: NodeJS.Timeout | null = null;
  
  constructor(
    private batchSize: number,
    private batchTimeout: number,
    private onFlush: (events: AnalyticsEvent[]) => void
  ) {}
  
  add(event: AnalyticsEvent): void {
    this.queue.push(event);
    
    if (this.queue.length >= this.batchSize) {
      this.flush();
    } else if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), this.batchTimeout);
    }
  }
  
  flush(): void {
    if (this.queue.length === 0) return;
    
    const events = [...this.queue];
    this.queue = [];
    
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    
    this.onFlush(events);
  }
  
  destroy(): void {
    this.flush();
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
}