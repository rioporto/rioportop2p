'use client'

import { useEffect } from 'react'

export function ConversionAnalytics() {
  useEffect(() => {
    // Track page view
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: window.location.pathname,
        page_title: document.title,
      })
    }

    // Track scroll depth
    let maxScroll = 0
    const trackScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      )
      
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent
        
        if ([25, 50, 75, 100].includes(scrollPercent)) {
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'scroll', {
              event_category: 'engagement',
              event_label: 'scroll_depth',
              value: scrollPercent
            })
          }
        }
      }
    }

    window.addEventListener('scroll', trackScroll)
    return () => window.removeEventListener('scroll', trackScroll)
  }, [])

  return null
}