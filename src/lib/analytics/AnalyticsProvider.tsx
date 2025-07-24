'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { analytics } from './tracker';
import { UserProperties, CookieConsent } from './types';
import { getCookieConsent, setCookieConsent } from './utils';
import { PRIVACY_CONFIG } from './config';

interface AnalyticsContextValue {
  initialized: boolean;
  cookieConsent: CookieConsent;
  updateConsent: (consent: Partial<CookieConsent>) => void;
  setUserProperties: (properties: Partial<UserProperties>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

interface AnalyticsProviderProps {
  children: React.ReactNode;
  userId?: string;
  userProperties?: Partial<UserProperties>;
}

export function AnalyticsProvider({ 
  children, 
  userId,
  userProperties 
}: AnalyticsProviderProps) {
  const [initialized, setInitialized] = useState(false);
  const [cookieConsent, setCookieConsentState] = useState<CookieConsent>(
    PRIVACY_CONFIG.defaultConsent
  );
  
  // Initialize analytics
  useEffect(() => {
    const initAnalytics = async () => {
      // Get saved consent
      const consent = getCookieConsent();
      setCookieConsentState(consent);
      
      // Initialize if consent given
      if (consent.analytics) {
        await analytics.initialize();
        
        // Set user properties if provided
        if (userId || userProperties) {
          analytics.setUserProperties({
            userId,
            ...userProperties,
          });
        }
        
        setInitialized(true);
      }
    };
    
    initAnalytics();
  }, [userId, userProperties]);
  
  // Update consent
  const updateConsent = (consent: Partial<CookieConsent>) => {
    setCookieConsent(consent);
    setCookieConsentState(prev => ({ ...prev, ...consent }));
    
    // Reinitialize analytics if consent granted
    if (consent.analytics && !initialized) {
      analytics.initialize().then(() => {
        setInitialized(true);
      });
    }
  };
  
  // Set user properties
  const setUserPropertiesHandler = (properties: Partial<UserProperties>) => {
    if (initialized) {
      analytics.setUserProperties(properties);
    }
  };
  
  const value: AnalyticsContextValue = {
    initialized,
    cookieConsent,
    updateConsent,
    setUserProperties: setUserPropertiesHandler,
  };
  
  return (
    <AnalyticsContext.Provider value={value}>
      {children}
      {!cookieConsent.analytics && <CookieConsentBanner onAccept={updateConsent} />}
    </AnalyticsContext.Provider>
  );
}

// Cookie Consent Banner
interface CookieConsentBannerProps {
  onAccept: (consent: Partial<CookieConsent>) => void;
}

function CookieConsentBanner({ onAccept }: CookieConsentBannerProps) {
  const [show, setShow] = useState(true);
  
  if (!show) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-300">
          <p className="mb-1">
            Usamos cookies para melhorar sua experiência e analisar o uso do site.
          </p>
          <p className="text-xs text-gray-400">
            Ao continuar navegando, você concorda com nossa{' '}
            <a href="/privacy" className="underline hover:text-white">
              Política de Privacidade
            </a>
            .
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => {
              onAccept({ analytics: false, marketing: false });
              setShow(false);
            }}
            className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
          >
            Rejeitar
          </button>
          
          <button
            onClick={() => {
              onAccept({ analytics: true, marketing: false });
              setShow(false);
            }}
            className="px-4 py-2 text-sm bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Aceitar Essenciais
          </button>
          
          <button
            onClick={() => {
              onAccept({ analytics: true, marketing: true });
              setShow(false);
            }}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Aceitar Todos
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook to use analytics
export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  
  if (!context) {
    throw new Error('useAnalytics must be used within AnalyticsProvider');
  }
  
  return context;
}