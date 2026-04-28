/**
 * Unified API Service for Track Your Sport
 *
 * Architecture:
 *   Cricket  → Vercel /api/cricket-*   → CricData.org
 *   Football → Vercel /api/football-*  → API-Football
 *   Others   → Vercel /api/sports-proxy?sport=X&status=Y → API-Sports (12 sports)
 *
 * Each API-Sports sport has its own 100 req/day free quota.
 * Client-side caching + request dedup keeps usage well under limits.
 */

// ─── Cache durations (ms) ────────────────────────────────────
const CACHE = {
  LIVE:     5  * 60 * 1000,      // 5 min  – live scores
  UPCOMING: 20 * 60 * 1000,      // 20 min – upcoming fixtures
  RECENT:   30 * 60 * 1000,      // 30 min – recent results
  SERIES:   60 * 60 * 1000,      // 1 hr   – series/league info
  STATIC:   24 * 60 * 60 * 1000, // 24 hr  – sport lists, health
};

export const DASHBOARD_REFRESH_INTERVAL = 10 * 60 * 1000; // 10 min

class APIService {
  constructor() {
    this.baseUrl =
      process.env.REACT_APP_VERCEL_API_URL ||
      'https://matcharena-api.vercel.app/api';
    this.cache = new Map();
    this.inflight = new Map();
  }

  // ==================== CORE FETCH ====================

  async _fetch(endpoint, cacheDuration) {
    const key = endpoint;

    // Fresh cache?
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.ts < cacheDuration) return cached.data;

    // Dedup in-flight
    if (this.inflight.has(key)) return this.inflight.get(key);

    const promise = (async () => {
      try {
        const res = await fetch(`${this.baseUrl}${endpoint}`, {
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        const data =
          json.success !== undefined ? (json.data ?? []) :
          Array.isArray(json) ? json : [];

        this.cache.set(key, { data, ts: Date.now() });
        return data;
      } catch (err) {
        console.warn(`⚠️ API ${endpoint}:`, err.message);
        if (cached) return cached.data;   // stale fallback
        return [];
      } finally {
        this.inflight.delete(key);
      }
    })();

    this.inflight.set(key, promise);
    return promise;
  }

  // ==================== CRICKET (CricData.org) ====================

  async getCricketLive()     { return (await this._fetch('/cricket-live', CACHE.LIVE)).map(normalizeCricketMatch); }
  async getCricketUpcoming() { return (await this._fetch('/cricket-upcoming', CACHE.UPCOMING)).map(normalizeCricketMatch); }
  async getCricketRecent()   { return (await this._fetch('/cricket-recent', CACHE.RECENT)).map(normalizeCricketMatch); }
  async getCricketSeries()   { return (await this._fetch('/cricket-series', CACHE.SERIES)).map(normalizeCricketSeries); }

  // ==================== FOOTBALL (dedicated endpoints) ====================

  async getFootballLive()     { return this._fetch('/football-live', CACHE.LIVE); }
  async getFootballUpcoming() { return this._fetch('/football-upcoming', CACHE.UPCOMING); }

  // ==================== GENERIC SPORT (API-Sports proxy) ====================

  /**
   * Fetch live or upcoming data for ANY API-Sports sport.
   * sport: 'basketball' | 'hockey' | 'baseball' | 'rugby' | ...
   * status: 'live' | 'upcoming'
   */
  async getSportData(sport, status = 'live') {
    // Use dedicated endpoints for cricket
    if (sport === 'cricket') {
      if (status === 'live') return this.getCricketLive();
      if (status === 'upcoming') return this.getCricketUpcoming();
      if (status === 'recent') return this.getCricketRecent();
    }
    // Use dedicated endpoints for football live/upcoming
    if (sport === 'football' && (status === 'live' || status === 'upcoming')) {
      return status === 'live' ? this.getFootballLive() : this.getFootballUpcoming();
    }
    // All other sports + football recent go through the generic proxy
    const cacheDuration = status === 'live' ? CACHE.LIVE : status === 'recent' ? CACHE.RECENT : CACHE.UPCOMING;
    return this._fetch(`/sports-proxy?sport=${sport}&status=${status}`, cacheDuration);
  }

  // ==================== DASHBOARD ====================

  /**
   * Home page data – only fetches FEATURED sports (cricket + football + basketball).
   * Other sports are lazy-loaded when user navigates to them.
   * This keeps total API calls to ~3 on page load.
   */
  async getDashboardData() {
    const [cricLive, fbLive, bbLive] = await Promise.allSettled([
      this.getCricketLive(),
      this.getFootballLive(),
      this.getSportData('basketball', 'live'),
    ]);

    const cricket    = cricLive.status === 'fulfilled' ? cricLive.value : [];
    const football   = fbLive.status   === 'fulfilled' ? fbLive.value   : [];
    const basketball = bbLive.status   === 'fulfilled' ? bbLive.value   : [];

    return {
      cricket:    { live: cricket },
      football:   { live: football },
      basketball: { live: basketball },
      allLive: [...cricket, ...football, ...basketball],
      summary: {
        totalLive:      cricket.length + football.length + basketball.length,
        cricketLive:    cricket.length,
        footballLive:   football.length,
        basketballLive: basketball.length,
      },
      lastUpdated: Date.now(),
    };
  }

  // ==================== HEALTH ====================

  async checkHealth() {
    try { return (await fetch(`${this.baseUrl}/health`)).json(); }
    catch { return { status: 'unreachable' }; }
  }

  // ==================== CACHE ====================

  clearCache(pattern) {
    if (!pattern) { this.cache.clear(); return; }
    for (const k of this.cache.keys()) if (k.includes(pattern)) this.cache.delete(k);
  }

  refreshLive() {
    this.clearCache('live');
    return this.getDashboardData();
  }

  getCacheStats() {
    const out = [];
    for (const [k, v] of this.cache.entries()) {
      out.push({ key: k, age: Math.round((Date.now() - v.ts) / 1000) + 's', items: Array.isArray(v.data) ? v.data.length : '—' });
    }
    return out;
  }
}

// ==================== DATA NORMALIZERS ====================

function normalizeCricketMatch(m) {
  if (!m) return null;
  const tA = m.teamInfo?.[0] || {};
  const tB = m.teamInfo?.[1] || {};
  const sA = m.score?.[0] || {};
  const sB = m.score?.[1] || {};

  let status = 'upcoming';
  if (m.matchStarted && !m.matchEnded) status = 'live';
  else if (m.matchEnded) status = 'completed';

  return {
    id: m.id, sport: 'cricket', sportIcon: '🏏',
    name: m.name || `${tA.name || m.teams?.[0] || 'TBA'} vs ${tB.name || m.teams?.[1] || 'TBA'}`,
    status, matchType: m.matchType || '',
    homeTeam: { name: tA.name || m.teams?.[0] || 'TBA', short: tA.shortname || '', logo: tA.img || '' },
    awayTeam: { name: tB.name || m.teams?.[1] || 'TBA', short: tB.shortname || '', logo: tB.img || '' },
    score: {
      home: sA.r != null ? `${sA.r}/${sA.w ?? '?'} (${sA.o ?? '?'})` : '',
      away: sB.r != null ? `${sB.r}/${sB.w ?? '?'} (${sB.o ?? '?'})` : '',
    },
    venue: m.venue || '', league: '', date: m.dateTimeGMT || m.date || '',
    statusText: m.status || '', raw: m,
  };
}

function normalizeCricketSeries(s) {
  if (!s) return null;
  return {
    id: s.id, name: s.name || 'Unknown Series',
    startDate: s.startDate || '', endDate: s.endDate || '',
    odi: s.odi || 0, t20: s.t20 || 0, test: s.test || 0,
    squads: s.squads || 0, matches: s.matches || 0,
  };
}

// ==================== SINGLETON ====================

export const apiService = new APIService();
export default apiService;
