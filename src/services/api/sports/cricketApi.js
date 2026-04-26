/**
 * Cricket API Service
 * Now uses Firebase Functions for secure API calls
 */

import { BaseSportAdapter, AdapterError, ERROR_CODES } from '../adapters/base';

// Vercel API base URL - always use production Vercel endpoint
const FUNCTIONS_BASE = 'https://track-your-sport-116q0rnj1-harshit-kumars-projects-27b7606f.vercel.app/api';

class CricketAPIService extends BaseSportAdapter {
  constructor() {
    super('cricket');
    this.functionsBase = FUNCTIONS_BASE;
    this.cache = new Map();
    this.cacheTimeout = 30000; // 30 second cache - reduced for testing
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
      console.log('Fetching from Vercel API:', url);
      
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
      console.log('API Response:', result);
      
      // Handle both API format and direct JSON
      let data;
      if (result && typeof result === 'object' && result.success !== undefined) {
        // API format with success property
        if (!result.success) {
          throw new AdapterError(
            result.error || 'API request failed',
            ERROR_CODES.API_ERROR,
            result
          );
        }
        data = result.data || result;
      } else {
        // Direct JSON data
        data = result;
      }
      
      console.log('Processed data:', data);
      
      // Cache the response
      this.cache.set(cacheKey, {
        data: data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error('Firebase Function Error:', error);
      
      // Return stale cache if available
      if (this.cache.has(cacheKey)) {
        console.warn('Using stale cache due to error:', error.message);
        return this.cache.get(cacheKey).data;
      }
      
      throw new AdapterError(
        'Failed to fetch cricket data from server',
        ERROR_CODES.NETWORK_ERROR,
        { originalError: error.message }
      );
    }
  }

  async getLiveMatches() {
    try {
      return await this.fetchFromFunction('/cricket-live', 'cricket_live_matches');
    } catch (error) {
      console.error('Error fetching live cricket matches:', error);
      return [];
    }
  }

  async getUpcomingMatches(_days = 7) {
    try {
      return await this.fetchFromFunction('/cricket-upcoming', 'cricket_upcoming_matches');
    } catch (error) {
      console.error('Error fetching upcoming cricket matches:', error);
      return [];
    }
  }

  async getRecentMatches(_days = 7) {
    try {
      return await this.fetchFromFunction('/cricket-recent', 'cricket_recent_matches');
    } catch (error) {
      console.error('Error fetching recent cricket matches:', error);
      return [];
    }
  }

  async getMatchDetail(matchId) {
    try {
      return await this.fetchFromFunction(`/cricket/match/${matchId}`, `cricket_match_${matchId}`);
    } catch (error) {
      throw new AdapterError(
        'Failed to fetch match details',
        ERROR_CODES.API_ERROR,
        { matchId, error: error.message }
      );
    }
  }

  async getSeries() {
    try {
      return await this.fetchFromFunction('/cricket-series', 'cricket_series');
    } catch (error) {
      console.error('Error fetching cricket series:', error);
      return [];
    }
  }

  normalizeMatch(rawMatch) {
    // Normalize raw API response to standard format
    return {
      id: rawMatch.id || rawMatch.match_id,
      sport: 'cricket',
      // ... map other fields
    };
  }

  normalizeSeries(rawSeries) {
    // Normalize raw API response to standard format
    return {
      id: rawSeries.id || rawSeries.series_id,
      sport: 'cricket',
      // ... map other fields
    };
  }
}

// Export singleton instance
export const cricketAPI = new CricketAPIService();

// Export function to get all cricket data
export async function fetchCricketData() {
  try {
    const [liveMatches, upcomingMatches, recentMatches, series] = await Promise.all([
      cricketAPI.getLiveMatches(),
      cricketAPI.getUpcomingMatches(7),
      cricketAPI.getRecentMatches(7),
      cricketAPI.getSeries()
    ]);

    return {
      live: liveMatches,
      upcoming: upcomingMatches,
      recent: recentMatches,
      series: series,
      lastUpdated: Date.now()
    };
  } catch (error) {
    console.error('Error fetching cricket data:', error);
    return {
      live: [],
      upcoming: [],
      recent: [],
      series: [],
      lastUpdated: Date.now(),
      error: error.message
    };
  }
}

export default cricketAPI;