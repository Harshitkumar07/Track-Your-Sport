/**
 * Cricket API Service
 * Thin wrapper around the unified apiService for backward compatibility.
 * All actual fetching + caching is handled by apiService.js
 */

import apiService from '../../apiService';

class CricketAPIService {
  async getLiveMatches()          { return apiService.getCricketLive(); }
  async getUpcomingMatches()      { return apiService.getCricketUpcoming(); }
  async getRecentMatches()        { return apiService.getCricketRecent(); }
  async getSeries()               { return apiService.getCricketSeries(); }

  async getMatchDetail(matchId) {
    // For now, search the cached live/upcoming/recent data for this match
    const [live, upcoming, recent] = await Promise.all([
      apiService.getCricketLive(),
      apiService.getCricketUpcoming(),
      apiService.getCricketRecent(),
    ]);
    const all = [...live, ...upcoming, ...recent];
    return all.find(m => m.id === matchId) || null;
  }
}

// Export singleton instance
export const cricketAPI = new CricketAPIService();

// Export function to get all cricket data
export async function fetchCricketData() {
  try {
    const [live, upcoming, recent, series] = await Promise.allSettled([
      cricketAPI.getLiveMatches(),
      cricketAPI.getUpcomingMatches(),
      cricketAPI.getRecentMatches(),
      cricketAPI.getSeries(),
    ]);

    return {
      live:     live.status === 'fulfilled'     ? live.value     : [],
      upcoming: upcoming.status === 'fulfilled' ? upcoming.value : [],
      recent:   recent.status === 'fulfilled'   ? recent.value   : [],
      series:   series.status === 'fulfilled'   ? series.value   : [],
      lastUpdated: Date.now(),
    };
  } catch (error) {
    console.error('Error fetching cricket data:', error);
    return { live: [], upcoming: [], recent: [], series: [], lastUpdated: Date.now(), error: error.message };
  }
}

export default cricketAPI;