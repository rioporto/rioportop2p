import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { AnalyticsEvent, UserProperties } from '@/lib/analytics/types';

// Server-side analytics tracking endpoint
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, events, userProperties } = body as {
      sessionId: string;
      events: AnalyticsEvent[];
      userProperties: UserProperties;
    };
    
    // Validate request
    if (!sessionId || !events || !Array.isArray(events)) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }
    
    // Get user IP and user agent for server-side tracking
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    // Process events in batch
    const analyticsRecords = events.map(event => ({
      sessionId,
      eventName: event.name,
      eventTimestamp: new Date(event.timestamp || Date.now()),
      eventParameters: JSON.stringify(event.parameters),
      userId: userProperties.userId,
      userType: userProperties.userType || 'visitor',
      ipAddress: ip,
      userAgent,
    }));
    
    // Store events in database
    await prisma.analyticsEvent.createMany({
      data: analyticsRecords,
      skipDuplicates: true,
    });
    
    // Send to Google Analytics Measurement Protocol (server-side)
    if (process.env.GA4_API_SECRET && process.env.GA4_MEASUREMENT_ID) {
      await sendToGA4(sessionId, events, userProperties);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Send events to GA4 using Measurement Protocol
async function sendToGA4(
  sessionId: string,
  events: AnalyticsEvent[],
  userProperties: UserProperties
) {
  const measurementId = process.env.GA4_MEASUREMENT_ID;
  const apiSecret = process.env.GA4_API_SECRET;
  
  if (!measurementId || !apiSecret) return;
  
  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`;
  
  // Convert events to GA4 format
  const ga4Events = events.map(event => ({
    name: event.name,
    params: {
      ...event.parameters,
      session_id: sessionId,
      engagement_time_msec: 100, // Required parameter
    },
  }));
  
  const payload = {
    client_id: userProperties.userId || sessionId,
    user_properties: {
      user_type: { value: userProperties.userType },
      kyc_level: { value: userProperties.kycLevel?.toString() },
    },
    events: ga4Events,
  };
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      console.error('GA4 Measurement Protocol error:', response.status);
    }
  } catch (error) {
    console.error('Failed to send to GA4:', error);
  }
}

// GET endpoint for analytics reports (for internal dashboard)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'today';
    
    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'realtime':
        startDate = new Date(now.getTime() - 5 * 60 * 1000); // Last 5 minutes
        break;
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
    
    // Get analytics data
    const [
      totalEvents,
      uniqueSessions,
      conversionEvents,
      topPages,
      userFlow,
    ] = await Promise.all([
      // Total events
      prisma.analyticsEvent.count({
        where: {
          eventTimestamp: { gte: startDate },
        },
      }),
      
      // Unique sessions
      prisma.analyticsEvent.groupBy({
        by: ['sessionId'],
        where: {
          eventTimestamp: { gte: startDate },
        },
        _count: true,
      }),
      
      // Conversion funnel
      prisma.analyticsEvent.groupBy({
        by: ['eventName'],
        where: {
          eventTimestamp: { gte: startDate },
          eventName: {
            in: ['conversion'],
          },
        },
        _count: true,
      }),
      
      // Top pages
      prisma.analyticsEvent.findMany({
        where: {
          eventTimestamp: { gte: startDate },
          eventName: 'page_view',
        },
        select: {
          eventParameters: true,
        },
        take: 10,
      }),
      
      // User flow (simplified)
      prisma.analyticsEvent.findMany({
        where: {
          eventTimestamp: { gte: startDate },
          eventName: 'page_view',
        },
        orderBy: {
          eventTimestamp: 'asc',
        },
        select: {
          sessionId: true,
          eventParameters: true,
          eventTimestamp: true,
        },
      }),
    ]);
    
    // Process data for response
    const report = {
      period,
      totalEvents,
      uniqueSessions: uniqueSessions.length,
      avgEventsPerSession: totalEvents / Math.max(uniqueSessions.length, 1),
      conversionRate: calculateConversionRate(conversionEvents, uniqueSessions.length),
      topPages: processTopPages(topPages),
      userFlow: processUserFlow(userFlow),
    };
    
    return NextResponse.json(report);
  } catch (error) {
    console.error('Analytics report error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
function calculateConversionRate(
  conversionEvents: any[],
  totalSessions: number
): number {
  if (totalSessions === 0) return 0;
  
  const conversions = conversionEvents.reduce((sum, event) => sum + event._count, 0);
  return (conversions / totalSessions) * 100;
}

function processTopPages(pageViews: any[]): any[] {
  const pageMap = new Map<string, number>();
  
  pageViews.forEach(event => {
    try {
      const params = JSON.parse(event.eventParameters);
      const path = params.page_path || '/';
      pageMap.set(path, (pageMap.get(path) || 0) + 1);
    } catch (e) {
      // Skip invalid data
    }
  });
  
  return Array.from(pageMap.entries())
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);
}

function processUserFlow(events: any[]): any[] {
  const flows = new Map<string, number>();
  const sessionPaths = new Map<string, string[]>();
  
  // Group by session
  events.forEach(event => {
    try {
      const params = JSON.parse(event.eventParameters);
      const path = params.page_path || '/';
      
      if (!sessionPaths.has(event.sessionId)) {
        sessionPaths.set(event.sessionId, []);
      }
      sessionPaths.get(event.sessionId)!.push(path);
    } catch (e) {
      // Skip invalid data
    }
  });
  
  // Calculate flows
  sessionPaths.forEach(paths => {
    for (let i = 0; i < paths.length - 1; i++) {
      const flow = `${paths[i]} → ${paths[i + 1]}`;
      flows.set(flow, (flows.get(flow) || 0) + 1);
    }
  });
  
  return Array.from(flows.entries())
    .map(([flow, count]) => {
      const [from, to] = flow.split(' → ');
      return { from, to, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
}