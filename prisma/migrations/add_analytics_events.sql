-- CreateTable for Analytics Events
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "eventTimestamp" DATETIME NOT NULL,
    "eventParameters" TEXT NOT NULL, -- JSON string
    "userId" TEXT,
    "userType" TEXT NOT NULL DEFAULT 'visitor',
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Indexes for common queries
    INDEX "AnalyticsEvent_sessionId_idx" ("sessionId"),
    INDEX "AnalyticsEvent_eventName_idx" ("eventName"),
    INDEX "AnalyticsEvent_eventTimestamp_idx" ("eventTimestamp"),
    INDEX "AnalyticsEvent_userId_idx" ("userId"),
    INDEX "AnalyticsEvent_createdAt_idx" ("createdAt")
);

-- CreateTable for Aggregated Analytics (for faster dashboard queries)
CREATE TABLE "AnalyticsAggregate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "period" TEXT NOT NULL, -- 'hour', 'day', 'week', 'month'
    "metric" TEXT NOT NULL,
    "dimension" TEXT,
    "value" REAL NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "metadata" TEXT, -- JSON string for additional data
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    -- Indexes for efficient queries
    INDEX "AnalyticsAggregate_date_period_idx" ("date", "period"),
    INDEX "AnalyticsAggregate_metric_idx" ("metric"),
    UNIQUE INDEX "AnalyticsAggregate_date_period_metric_dimension_key" ("date", "period", "metric", "dimension")
);

-- CreateTable for User Sessions
CREATE TABLE "AnalyticsSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL UNIQUE,
    "userId" TEXT,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME,
    "duration" INTEGER, -- in seconds
    "pageViews" INTEGER NOT NULL DEFAULT 0,
    "events" INTEGER NOT NULL DEFAULT 0,
    "source" TEXT,
    "medium" TEXT,
    "campaign" TEXT,
    "deviceType" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "country" TEXT,
    "city" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    -- Indexes
    INDEX "AnalyticsSession_userId_idx" ("userId"),
    INDEX "AnalyticsSession_startTime_idx" ("startTime"),
    INDEX "AnalyticsSession_source_medium_idx" ("source", "medium")
);