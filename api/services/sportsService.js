const fetch = require('node-fetch');

class SportsService {
  constructor() {
    this.apiKey = process.env.APISPORTS_KEY;
    this.baseUrl = 'https://v3.football.api-sports.io';
    
    if (!this.apiKey) {
      console.warn('APISPORTS_KEY not found in environment variables');
    }
    
    // Sport mappings for API-Sports
    this.sportMappings = {
      'football': { baseUrl: 'https://v3.football.api-sports.io', endpoint: 'fixtures' },
      'basketball': { baseUrl: 'https://v1.basketball.api-sports.io', endpoint: 'games' },
      'baseball': { baseUrl: 'https://v1.baseball.api-sports.io', endpoint: 'games' },
      'hockey': { baseUrl: 'https://v1.hockey.api-sports.io', endpoint: 'games' },
      'tennis': { baseUrl: 'https://v1.tennis.api-sports.io', endpoint: 'fixtures' },
      'volleyball': { baseUrl: 'https://v1.volleyball.api-sports.io', endpoint: 'games' },
      'handball': { baseUrl: 'https://v1.handball.api-sports.io', endpoint: 'fixtures' },
      'rugby': { baseUrl: 'https://v1.rugby.api-sports.io', endpoint: 'games' }
    };
  }

  /**
   * Make HTTP request to API-Sports
   */
  async makeRequest(sport, endpoint, params = {}) {
    try {
      const sportConfig = this.sportMappings[sport.toLowerCase()];
      if (!sportConfig) {
        throw new Error(`Unsupported sport: ${sport}`);
      }

      const url = new URL(`${sportConfig.baseUrl}/${endpoint}`);
      
      // Add parameters
      Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key]);
      });

      console.log(`Fetching ${sport} data from: ${endpoint}`);
      const response = await fetch(url.toString(), {
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': sportConfig.baseUrl.replace('https://', '')
        }
      });
      
      if (!response.ok) {
        throw new Error(`API-Sports request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.response || data;
    } catch (error) {
      console.error(`API-Sports ${sport} request error:`, error);
      throw error;
    }
  }

  /**
   * Get supported sports list
   */
  async getSupportedSports() {
    return Object.keys(this.sportMappings).map(sport => ({
      key: sport,
      name: sport.charAt(0).toUpperCase() + sport.slice(1),
      available: true
    }));
  }

  /**
   * Get live matches for a specific sport
   */
  async getLiveMatches(sport) {
    try {
      const sportConfig = this.sportMappings[sport.toLowerCase()];
      if (!sportConfig) {
        return [];
      }

      const data = await this.makeRequest(sport, sportConfig.endpoint, {
        live: 'all',
        timezone: 'UTC'
      });
      
      return Array.isArray(data) ? data.slice(0, 20) : [];
    } catch (error) {
      console.error(`Error fetching live ${sport} matches:`, error);
      return []; // Return empty array on error
    }
  }

  /**
   * Get upcoming matches for a specific sport
   */
  async getUpcomingMatches(sport) {
    try {
      const sportConfig = this.sportMappings[sport.toLowerCase()];
      if (!sportConfig) {
        return [];
      }

      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const data = await this.makeRequest(sport, sportConfig.endpoint, {
        from: today,
        to: nextWeek,
        timezone: 'UTC'
      });
      
      return Array.isArray(data) ? data.slice(0, 20) : [];
    } catch (error) {
      console.error(`Error fetching upcoming ${sport} matches:`, error);
      return []; // Return empty array on error
    }
  }

  /**
   * Get recent matches for a specific sport
   */
  async getRecentMatches(sport) {
    try {
      const sportConfig = this.sportMappings[sport.toLowerCase()];
      if (!sportConfig) {
        return [];
      }

      const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];

      const data = await this.makeRequest(sport, sportConfig.endpoint, {
        from: lastWeek,
        to: today,
        status: 'FT',
        timezone: 'UTC'
      });
      
      return Array.isArray(data) ? data.slice(0, 20) : [];
    } catch (error) {
      console.error(`Error fetching recent ${sport} matches:`, error);
      return []; // Return empty array on error
    }
  }

  /**
   * Get leagues for a specific sport
   */
  async getLeagues(sport) {
    try {
      const data = await this.makeRequest(sport, 'leagues', {
        current: 'true'
      });
      
      return Array.isArray(data) ? data.slice(0, 50) : [];
    } catch (error) {
      console.error(`Error fetching ${sport} leagues:`, error);
      return []; // Return empty array on error
    }
  }

  /**
   * Get all live matches from multiple sports
   */
  async getAllLiveMatches() {
    const sports = ['football', 'basketball', 'tennis'];
    const allMatches = [];

    for (const sport of sports) {
      try {
        const matches = await this.getLiveMatches(sport);
        allMatches.push(...matches.map(match => ({
          ...match,
          sport: sport
        })));
      } catch (error) {
        console.error(`Error fetching live ${sport} matches:`, error);
        // Continue with other sports
      }
    }

    return allMatches.slice(0, 30); // Limit total results
  }

  /**
   * Get popular sports with sample data
   */
  async getPopularSports() {
    const popularSports = ['football', 'basketball', 'tennis', 'hockey'];
    const result = [];

    for (const sport of popularSports) {
      try {
        const liveMatches = await this.getLiveMatches(sport);
        result.push({
          sport: sport,
          name: sport.charAt(0).toUpperCase() + sport.slice(1),
          liveMatches: liveMatches.length,
          hasLiveMatches: liveMatches.length > 0
        });
      } catch (error) {
        console.error(`Error fetching ${sport} data:`, error);
        result.push({
          sport: sport,
          name: sport.charAt(0).toUpperCase() + sport.slice(1),
          liveMatches: 0,
          hasLiveMatches: false
        });
      }
    }

    return result;
  }
}

module.exports = SportsService;
