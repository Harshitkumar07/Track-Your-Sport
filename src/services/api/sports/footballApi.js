/**
 * Football API Service
 * Uses Vercel serverless functions for API-SPORTS data
 */

import { BaseSportAdapter, AdapterError, ERROR_CODES } from '../adapters/base';

// Vercel API base URL
const FUNCTIONS_BASE = 'https://matcharena-116q0rnj1-harshit-kumars-projects-27b7606f.vercel.app/api';

class FootballAPIService extends BaseSportAdapter {
  constructor() {
    super('football');
    this.functionsBase = FUNCTIONS_BASE;
    this.cache = new Map();
    this.cacheTimeout = 60000; // 1 minute cache
  }

  async fetchFromFunction(endpoint, cacheKey, options = {}) {
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const url = `${this.functionsBase}${endpoint}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`API response not ok: ${response.status}`);
      }

      const result = await response.json();
      
      // Handle API format
      let data;
      if (result && typeof result === 'object' && result.success !== undefined) {
        if (!result.success) {
          throw new AdapterError(
            result.error || 'API request failed',
            ERROR_CODES.API_ERROR,
            result
          );
        }
        data = result.data || [];
      } else {
        data = result;
      }
      
      // Cache the response
      this.cache.set(cacheKey, {
        data: data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error('Football Function Error:', error);
      
      // Return stale cache if available
      if (this.cache.has(cacheKey)) {
        console.warn('Using stale cache due to error:', error.message);
        return this.cache.get(cacheKey).data;
      }
      
      throw new AdapterError(
        'Failed to fetch football data from server',
        ERROR_CODES.NETWORK_ERROR,
        { originalError: error.message }
      );
    }
  }

  async getLiveMatches() {
    try {
      return await this.fetchFromFunction('/football-live', 'football_live_matches');
    } catch (error) {
      console.error('Error fetching live football matches:', error);
      return [];
    }
  }

  async getUpcomingMatches(_days = 7) {
    try {
      return await this.fetchFromFunction('/football-upcoming', 'football_upcoming_matches');
    } catch (error) {
      console.error('Error fetching upcoming football matches:', error);
      return [];
    }
  }

  async getRecentMatches(_days = 7) {
    // Football recent matches endpoint not yet created, return empty for now
    return [];
  }

  async getLeagues() {
    // Football leagues endpoint not yet created, return empty for now
    return [];
  }
}

// Export singleton instance
export const footballAPI = new FootballAPIService();

// Export function to get all football data
export async function fetchFootballData() {
  try {
    const [liveMatches, upcomingMatches, recentMatches] = await Promise.all([
      footballAPI.getLiveMatches(),
      footballAPI.getUpcomingMatches(7),
      footballAPI.getRecentMatches(7)
    ]);

    return {
      live: liveMatches,
      upcoming: upcomingMatches,
      recent: recentMatches,
      lastUpdated: Date.now()
    };
  } catch (error) {
    console.error('Error fetching football data:', error);
    return {
      live: [],
      upcoming: [],
      recent: [],
      lastUpdated: Date.now(),
      error: error.message
    };
  }
}

export default footballAPI;
