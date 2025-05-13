/**
 * Email statistics API functions
 *
 * This module provides functions to fetch email performance metrics and trends
 * from the backend API.
 */

import { AxiosError } from 'axios';
import { api } from '@/lib/api/client';

/**
 * Time period for statistics queries
 */
export type StatsPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

/**
 * Email message status
 */
export type EmailStatus =
  | 'sent'
  | 'delivered'
  | 'opened'
  | 'clicked'
  | 'bounced'
  | 'rejected'
  | 'spam'
  | 'unsubscribed';

/**
 * Parameters for fetching email statistics
 */
export interface EmailStatsParams {
  /**
   * Start date for statistics (ISO string)
   */
  startDate?: string;

  /**
   * End date for statistics (ISO string)
   */
  endDate?: string;

  /**
   * Pre-defined time period
   */
  period?: StatsPeriod;

  /**
   * Filter by campaign ID
   */
  campaignId?: string;

  /**
   * Filter by template ID
   */
  templateId?: string;

  /**
   * Filter by tags (comma-separated)
   */
  tags?: string;

  /**
   * Filter by recipient domain (e.g., "gmail.com")
   */
  domain?: string;

  /**
   * Include detailed geographic data
   */
  includeGeographicData?: boolean;

  /**
   * Include device and client information
   */
  includeDeviceData?: boolean;

  /**
   * Group results by (day, week, month, template, campaign)
   */
  groupBy?: string;
}

/**
 * Email statistics summary
 */
export interface EmailStats {
  /**
   * Total emails sent
   */
  sent: number;

  /**
   * Total emails delivered
   */
  delivered: number;

  /**
   * Total emails opened
   */
  opened: number;

  /**
   * Total emails clicked
   */
  clicked: number;

  /**
   * Total emails bounced
   */
  bounced: number;

  /**
   * Total emails marked as spam
   */
  spam: number;

  /**
   * Total unsubscribes
   */
  unsubscribed: number;

  /**
   * Open rate (opened / delivered)
   */
  openRate: number;

  /**
   * Click rate (clicked / delivered)
   */
  clickRate: number;

  /**
   * Click-to-open rate (clicked / opened)
   */
  clickToOpenRate: number;

  /**
   * Bounce rate (bounced / sent)
   */
  bounceRate: number;

  /**
   * Unsubscribe rate (unsubscribed / delivered)
   */
  unsubscribeRate: number;

  /**
   * Spam complaint rate (spam / delivered)
   */
  spamRate: number;

  /**
   * Categorized bounce reasons
   */
  bounceReasons?: Record<string, number>;

  /**
   * Geographic distribution of opens
   */
  geoData?: {
    country: Record<string, number>;
    region?: Record<string, number>;
    city?: Record<string, number>;
  };

  /**
   * Device and client data
   */
  deviceData?: {
    deviceType: Record<string, number>;
    operatingSystem: Record<string, number>;
    emailClient: Record<string, number>;
    browser?: Record<string, number>;
  };

  /**
   * Time periods for the data
   */
  period: {
    start: string;
    end: string;
    granularity: string;
  };
}

/**
 * Email trend data point
 */
export interface EmailTrendPoint {
  /**
   * Date for this data point (ISO string)
   */
  date: string;

  /**
   * Number of emails sent
   */
  sent: number;

  /**
   * Number of emails delivered
   */
  delivered: number;

  /**
   * Number of emails opened
   */
  opened: number;

  /**
   * Number of emails clicked
   */
  clicked: number;

  /**
   * Number of emails bounced
   */
  bounced: number;

  /**
   * Number of emails marked as spam
   */
  spam: number;

  /**
   * Number of unsubscribes
   */
  unsubscribed: number;

  /**
   * Open rate for this period
   */
  openRate: number;

  /**
   * Click rate for this period
   */
  clickRate: number;

  /**
   * Additional metrics
   */
  [key: string]: any;
}

/**
 * Email trend data
 */
export interface EmailTrends {
  /**
   * Array of trend data points
   */
  points: EmailTrendPoint[];

  /**
   * Comparison to previous period
   */
  comparison?: {
    openRate: number;
    clickRate: number;
    bounceRate: number;
    unsubscribeRate: number;
  };

  /**
   * Time period information
   */
  period: {
    start: string;
    end: string;
    granularity: string;
    previousStart?: string;
    previousEnd?: string;
  };
}

/**
 * Error thrown when email stats API calls fail
 */
export class EmailStatsError extends Error {
  statusCode?: number;
  responseData?: any;

  constructor(message: string, statusCode?: number, responseData?: any) {
    super(message);
    this.name = 'EmailStatsError';
    this.statusCode = statusCode;
    this.responseData = responseData;
  }
}

/**
 * Fetches email statistics based on the provided parameters
 *
 * @param params - Query parameters for filtering and customizing the stats
 * @returns Promise resolving to email statistics
 * @throws {EmailStatsError} When the API request fails
 *
 * @example
 * ```typescript
 * // Get stats for the last 30 days
 * const stats = await fetchEmailStats({
 *   period: 'month',
 *   includeGeographicData: true
 * });
 *
 * // Get stats for a specific campaign
 * const campaignStats = await fetchEmailStats({
 *   campaignId: 'campaign_123',
 *   startDate: '2023-01-01',
 *   endDate: '2023-01-31'
 * });
 * ```
 */
export async function fetchEmailStats(params: EmailStatsParams = {}): Promise<EmailStats> {
  try {
    // Handle custom period vs. predefined period
    let queryParams = { ...params };

    // Auto-populate dates for predefined periods if not explicitly set
    if (params.period && !params.startDate && !params.endDate) {
      const now = new Date();
      const endDate = new Date(now);
      let startDate = new Date(now);

      switch (params.period) {
        case 'day':
          startDate.setDate(startDate.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      queryParams.startDate = startDate.toISOString();
      queryParams.endDate = endDate.toISOString();
    }

    // Make the API request
    const response = await api.get('/email-stats', { params: queryParams });

    // Validate and process the response data
    const stats = response.data;

    // Calculate derived metrics if not provided by the API
    if (stats.delivered > 0) {
      if (!stats.openRate && stats.opened !== undefined) {
        stats.openRate = stats.opened / stats.delivered;
      }

      if (!stats.clickRate && stats.clicked !== undefined) {
        stats.clickRate = stats.clicked / stats.delivered;
      }

      if (!stats.unsubscribeRate && stats.unsubscribed !== undefined) {
        stats.unsubscribeRate = stats.unsubscribed / stats.delivered;
      }

      if (!stats.spamRate && stats.spam !== undefined) {
        stats.spamRate = stats.spam / stats.delivered;
      }
    }

    if (stats.opened > 0 && !stats.clickToOpenRate && stats.clicked !== undefined) {
      stats.clickToOpenRate = stats.clicked / stats.opened;
    }

    if (stats.sent > 0 && !stats.bounceRate && stats.bounced !== undefined) {
      stats.bounceRate = stats.bounced / stats.sent;
    }

    return stats;
  } catch (error) {
    // Handle errors
    if (error instanceof AxiosError) {
      const statusCode = error.response?.status;
      const responseData = error.response?.data;

      throw new EmailStatsError(
        `Failed to fetch email statistics: ${error.message}`,
        statusCode,
        responseData
      );
    }

    throw new EmailStatsError(`Failed to fetch email statistics: ${(error as Error).message}`);
  }
}

/**
 * Fetches email trend data for analyzing performance over time
 *
 * @param params - Query parameters for filtering and customizing the trends
 * @returns Promise resolving to email trend data
 * @throws {EmailStatsError} When the API request fails
 *
 * @example
 * ```typescript
 * // Get daily trends for the last month
 * const trends = await fetchEmailTrends({
 *   period: 'month',
 *   groupBy: 'day'
 * });
 *
 * // Compare two campaigns over time
 * const campaignTrends = await fetchEmailTrends({
 *   campaignId: 'campaign_123,campaign_456',
 *   startDate: '2023-01-01',
 *   endDate: '2023-03-31',
 *   groupBy: 'week'
 * });
 * ```
 */
export async function fetchEmailTrends(params: EmailStatsParams = {}): Promise<EmailTrends> {
  try {
    // Handle custom period vs. predefined period
    let queryParams = { ...params };

    // Set a default groupBy if not provided
    if (!queryParams.groupBy) {
      // Choose an appropriate granularity based on the date range
      if (params.period === 'day') {
        queryParams.groupBy = 'hour';
      } else if (params.period === 'week' || params.period === 'month') {
        queryParams.groupBy = 'day';
      } else if (params.period === 'quarter') {
        queryParams.groupBy = 'week';
      } else if (params.period === 'year') {
        queryParams.groupBy = 'month';
      } else {
        // Default for custom ranges
        queryParams.groupBy = 'day';
      }
    }

    // Auto-populate dates for predefined periods
    if (params.period && !params.startDate && !params.endDate) {
      const now = new Date();
      const endDate = new Date(now);
      let startDate = new Date(now);
      let previousStart, previousEnd;

      switch (params.period) {
        case 'day':
          startDate.setDate(startDate.getDate() - 1);
          // Previous period
          previousEnd = new Date(startDate);
          previousStart = new Date(previousEnd);
          previousStart.setDate(previousStart.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          // Previous period
          previousEnd = new Date(startDate);
          previousStart = new Date(previousEnd);
          previousStart.setDate(previousStart.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          // Previous period
          previousEnd = new Date(startDate);
          previousStart = new Date(previousEnd);
          previousStart.setMonth(previousStart.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(startDate.getMonth() - 3);
          // Previous period
          previousEnd = new Date(startDate);
          previousStart = new Date(previousEnd);
          previousStart.setMonth(previousStart.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          // Previous period
          previousEnd = new Date(startDate);
          previousStart = new Date(previousEnd);
          previousStart.setFullYear(previousStart.getFullYear() - 1);
          break;
      }

      queryParams.startDate = startDate.toISOString();
      queryParams.endDate = endDate.toISOString();

      // Add previous period info for comparison
      if (previousStart && previousEnd) {
        queryParams.previousStart = previousStart.toISOString();
        queryParams.previousEnd = previousEnd.toISOString();
      }
    }

    // Make the API request
    const response = await api.get('/email-trends', { params: queryParams });

    // Process the response data
    const trends = response.data;

    // Ensure the trends data includes calculated rates for each point
    trends.points = trends.points.map((point: EmailTrendPoint) => {
      // Calculate any missing rates
      if (point.delivered > 0) {
        if (point.openRate === undefined && point.opened !== undefined) {
          point.openRate = point.opened / point.delivered;
        }

        if (point.clickRate === undefined && point.clicked !== undefined) {
          point.clickRate = point.clicked / point.delivered;
        }
      }

      return point;
    });

    return trends;
  } catch (error) {
    // Handle errors
    if (error instanceof AxiosError) {
      const statusCode = error.response?.status;
      const responseData = error.response?.data;

      throw new EmailStatsError(
        `Failed to fetch email trends: ${error.message}`,
        statusCode,
        responseData
      );
    }

    throw new EmailStatsError(`Failed to fetch email trends: ${(error as Error).message}`);
  }
}

/**
 * Calculate the difference between two values as a percentage
 *
 * @param current - Current value
 * @param previous - Previous value
 * @returns Percentage change (positive for increase, negative for decrease)
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return ((current - previous) / previous) * 100;
}

/**
 * Aggregates email stats by a specific property
 *
 * @param stats - Email statistics to aggregate
 * @param property - Property to aggregate by (e.g., 'country', 'deviceType')
 * @returns Aggregated data as a Record<string, number>
 */
export function aggregateStatsByProperty(
  stats: EmailStats,
  property: string
): Record<string, number> {
  if (property === 'country' && stats.geoData?.country) {
    return stats.geoData.country;
  }

  if (property === 'region' && stats.geoData?.region) {
    return stats.geoData.region;
  }

  if (property === 'city' && stats.geoData?.city) {
    return stats.geoData.city;
  }

  if (property === 'deviceType' && stats.deviceData?.deviceType) {
    return stats.deviceData.deviceType;
  }

  if (property === 'operatingSystem' && stats.deviceData?.operatingSystem) {
    return stats.deviceData.operatingSystem;
  }

  if (property === 'emailClient' && stats.deviceData?.emailClient) {
    return stats.deviceData.emailClient;
  }

  if (property === 'browser' && stats.deviceData?.browser) {
    return stats.deviceData.browser;
  }

  if (property === 'bounceReasons' && stats.bounceReasons) {
    return stats.bounceReasons;
  }

  // Return empty object if property not found
  return {};
}

export default {
  fetchEmailStats,
  fetchEmailTrends,
  calculatePercentageChange,
  aggregateStatsByProperty,
};
