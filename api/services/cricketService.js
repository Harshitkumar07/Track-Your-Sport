const fetch = require('node-fetch');

class CricketService {
  constructor() {
    this.apiKey = process.env.CRICAPI_KEY;
    this.baseUrl = 'https://api.cricapi.com/v1';
    
    if (!this.apiKey) {
      console.warn('CRICAPI_KEY not found in environment variables');
    }
  }

  /**
   * Make HTTP request to CricAPI
   */
  async makeRequest(endpoint, params = {}) {
    try {
      const url = new URL(`${this.baseUrl}${endpoint}`);
      url.searchParams.append('apikey', this.apiKey);
      
      // Add other parameters
      Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key]);
      });

      console.log(`Fetching cricket data from: ${endpoint}`);
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`CricAPI request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('CricAPI request error:', error);
      throw error;
    }
  }

  /**
   * Get live cricket matches
   */
  async getLiveMatches() {
    try {
      const data = await this.makeRequest('/currentMatches', { offset: 0 });
      
      // Filter and normalize matches
      const matches = Array.isArray(data) ? data : data.data || [];
      return matches.filter(match => match.matchStarted || match.status === 'Live');
    } catch (error) {
      console.error('Error fetching live cricket matches:', error);
      return []; // Return empty array on error
    }
  }

  /**
   * Get upcoming cricket matches
   */
  async getUpcomingMatches() {
    try {
      const data = await this.makeRequest('/matches', { offset: 0 });
      
      // Filter for upcoming matches
      const matches = Array.isArray(data) ? data : data.data || [];
      const now = Date.now();
      
      return matches.filter(match => {
        if (match.matchEnded) return false;
        if (match.matchStarted) return false;
        if (!match.dateTimeGMT) return false;
        
        const matchTime = new Date(match.dateTimeGMT).getTime();
        return matchTime > now;
      }).slice(0, 20); // Limit to 20 upcoming matches
    } catch (error) {
      console.error('Error fetching upcoming cricket matches:', error);
      return []; // Return empty array on error
    }
  }

  /**
   * Get recent/completed cricket matches
   */
  async getRecentMatches() {
    try {
      const data = await this.makeRequest('/matches', { offset: 0 });
      
      // Filter for completed matches
      const matches = Array.isArray(data) ? data : data.data || [];
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      
      return matches.filter(match => {
        if (!match.matchEnded) return false;
        if (!match.dateTimeGMT) return false;
        
        const matchTime = new Date(match.dateTimeGMT).getTime();
        return matchTime > sevenDaysAgo;
      }).slice(0, 20); // Limit to 20 recent matches
    } catch (error) {
      console.error('Error fetching recent cricket matches:', error);
      return []; // Return empty array on error
    }
  }

  /**
   * Get cricket series/tournaments
   */
  async getSeries() {
    try {
      const data = await this.makeRequest('/series', { offset: 0 });
      
      const series = Array.isArray(data) ? data : data.data || [];
      // Return active series
      return series.filter(s => !s.matches || s.matches > 0).slice(0, 20);
    } catch (error) {
      console.error('Error fetching cricket series:', error);
      return []; // Return empty array on error (series is optional)
    }
  }

  /**
   * Get match details
   */
  async getMatchDetails(matchId) {
    try {
      const data = await this.makeRequest('/match_info', { id: matchId });
      return data;
    } catch (error) {
      console.error('Error fetching cricket match details:', error);
      throw error;
    }
  }

  /**
   * Get match scorecard
   */
  async getMatchScorecard(matchId) {
    try {
      const data = await this.makeRequest('/match_scorecard', { id: matchId });
      return data;
    } catch (error) {
      console.error('Error fetching cricket scorecard:', error);
      // Scorecard might not be available for all matches
      return null;
    }
  }
}

module.exports = CricketService;
