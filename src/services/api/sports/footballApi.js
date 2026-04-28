/**
 * Football API Service
 * Thin wrapper around the unified apiService for backward compatibility.
 * All actual fetching + caching is handled by apiService.js
 */

import apiService from '../../apiService';

class FootballAPIService {
  async getLiveMatches()          { return apiService.getFootballLive(); }
  async getUpcomingMatches()      { return apiService.getFootballUpcoming(); }
  async getRecentMatches()        { return []; } // No Vercel endpoint yet
  async getLeagues()              { return []; } // No Vercel endpoint yet
}

// Export singleton instance
export const footballAPI = new FootballAPIService();

// Export function to get all football data
export async function fetchFootballData() {
  try {
    const [live, upcoming] = await Promise.allSettled([
      footballAPI.getLiveMatches(),
      footballAPI.getUpcomingMatches(),
    ]);

    return {
      live:     live.status === 'fulfilled'     ? live.value     : [],
      upcoming: upcoming.status === 'fulfilled' ? upcoming.value : [],
      recent:   [],
      lastUpdated: Date.now(),
    };
  } catch (error) {
    console.error('Error fetching football data:', error);
    return { live: [], upcoming: [], recent: [], lastUpdated: Date.now(), error: error.message };
  }
}

export default footballAPI;
