// Vercel Serverless Function – Generic proxy for ALL API-Sports endpoints
// Usage: /api/sports-proxy?sport=basketball&status=live|upcoming|recent
const fetch = require('node-fetch');

// Map sport slug → API host
const SPORT_HOSTS = {
  football:            'v3.football.api-sports.io',
  basketball:          'v1.basketball.api-sports.io',
  baseball:            'v1.baseball.api-sports.io',
  hockey:              'v1.hockey.api-sports.io',
  rugby:               'v1.rugby.api-sports.io',
  volleyball:          'v1.volleyball.api-sports.io',
  handball:            'v1.handball.api-sports.io',
  afl:                 'v1.afl.api-sports.io',
  'american-football': 'v1.american-football.api-sports.io',
  mma:                 'v1.mma.api-sports.io',
  'formula-1':         'v1.formula-1.api-sports.io',
  nba:                 'v2.nba.api-sports.io',
};

// Sport-specific endpoint names (most use /games, football uses /fixtures)
const SPORT_ENDPOINTS = {
  football:     'fixtures',
  'formula-1':  'races',
  mma:          'fights',
  // All others default to 'games'
};

function getEndpointName(sport) {
  return SPORT_ENDPOINTS[sport] || 'games';
}

// Helper: format date as YYYY-MM-DD
function fmtDate(d) { return d.toISOString().split('T')[0]; }

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const apiKey = process.env.APISPORTS_KEY;
    if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

    const { sport, status = 'live' } = req.query;

    if (!sport || !SPORT_HOSTS[sport]) {
      return res.status(400).json({
        error: `Unsupported sport "${sport}". Supported: ${Object.keys(SPORT_HOSTS).join(', ')}`,
      });
    }

    const host = SPORT_HOSTS[sport];
    const ep = getEndpointName(sport);
    const now = new Date();
    let url;

    // ── Build URL by status ──────────────────────────────────
    if (status === 'live') {
      if (sport === 'formula-1') {
        url = `https://${host}/${ep}?type=race&last=1`;
      } else if (sport === 'mma') {
        url = `https://${host}/${ep}?league=1&season=2026`;
      } else if (sport === 'football') {
        url = `https://${host}/${ep}?live=all`;
      } else {
        url = `https://${host}/${ep}?live=all`;
      }
    } else if (status === 'upcoming') {
      const end = new Date(now.getTime() + 7 * 86400000);
      if (sport === 'football') {
        url = `https://${host}/${ep}?from=${fmtDate(now)}&to=${fmtDate(end)}&timezone=Asia/Kolkata`;
      } else if (sport === 'formula-1') {
        url = `https://${host}/${ep}?season=2026&type=race`;
      } else if (sport === 'mma') {
        url = `https://${host}/${ep}?league=1&season=2026`;
      } else {
        url = `https://${host}/${ep}?date=${fmtDate(now)}`;
      }
    } else if (status === 'recent') {
      // Recent / completed – yesterday + today's finished games
      const yesterday = new Date(now.getTime() - 86400000);
      if (sport === 'football') {
        url = `https://${host}/${ep}?from=${fmtDate(yesterday)}&to=${fmtDate(now)}&timezone=Asia/Kolkata`;
      } else if (sport === 'formula-1') {
        url = `https://${host}/${ep}?season=2026&type=race&last=5`;
      } else if (sport === 'mma') {
        url = `https://${host}/${ep}?league=1&season=2026`;
      } else {
        url = `https://${host}/${ep}?date=${fmtDate(yesterday)}`;
      }
    } else {
      return res.status(400).json({ error: `Invalid status: ${status}. Use live, upcoming, or recent.` });
    }

    console.log(`[sports-proxy] ${sport}/${status} → ${url}`);

    const response = await fetch(url, {
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': host,
      },
    });

    if (!response.ok) {
      throw new Error(`API-SPORTS ${sport} request failed: ${response.status}`);
    }

    const data = await response.json();
    const items = data.response || [];

    // For "recent" status, filter to only completed matches
    let filtered = items;
    if (status === 'recent') {
      filtered = items.filter(item => {
        const st = item.fixture?.status?.short || item.status?.short || '';
        return ['FT', 'AET', 'PEN', 'AOT', 'AP', 'POST', 'CANC', 'ABD'].includes(st);
      });
    } else if (status === 'upcoming') {
      filtered = items.filter(item => {
        const st = item.fixture?.status?.short || item.status?.short || '';
        return ['TBD', 'NS', 'SUSP', 'INT', 'PST', 'CANC'].includes(st) || !st;
      });
    }

    const normalized = filtered.slice(0, 25).map(item => normalizeMatch(item, sport, status));

    res.status(200).json({
      success: true,
      data: normalized,
      count: normalized.length,
      sport,
      status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`[sports-proxy] Error:`, error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch ${req.query.sport} data`,
      message: error.message,
    });
  }
}

/**
 * Normalize different API-Sports response shapes into one common format.
 */
function normalizeMatch(item, sport, requestedStatus) {
  if (sport === 'football') {
    return {
      id: item.fixture?.id,
      sport,
      name: `${item.teams?.home?.name || 'TBA'} vs ${item.teams?.away?.name || 'TBA'}`,
      homeTeam: item.teams?.home?.name || 'TBA',
      awayTeam: item.teams?.away?.name || 'TBA',
      homeScore: item.goals?.home,
      awayScore: item.goals?.away,
      status: mapStatus(item.fixture?.status?.short, requestedStatus),
      statusShort: item.fixture?.status?.short,
      date: item.fixture?.date,
      venue: item.fixture?.venue?.name,
      league: item.league?.name,
      leagueLogo: item.league?.logo,
      homeTeamLogo: item.teams?.home?.logo,
      awayTeamLogo: item.teams?.away?.logo,
      elapsed: item.fixture?.status?.elapsed,
    };
  }

  if (sport === 'formula-1') {
    return {
      id: item.id,
      sport,
      name: item.competition?.name || item.circuit?.name || 'Race',
      homeTeam: item.circuit?.name || 'Circuit',
      awayTeam: item.competition?.name || '',
      homeScore: '',
      awayScore: '',
      status: item.status === 'Completed' ? 'completed' : 'upcoming',
      date: item.date,
      venue: item.circuit?.name,
      league: item.competition?.name || 'Formula 1',
      leagueLogo: item.competition?.logo,
    };
  }

  // Generic format for basketball, baseball, hockey, rugby, volleyball, etc.
  return {
    id: item.id,
    sport,
    name: `${item.teams?.home?.name || 'TBA'} vs ${item.teams?.away?.name || 'TBA'}`,
    homeTeam: item.teams?.home?.name || 'TBA',
    awayTeam: item.teams?.away?.name || 'TBA',
    homeScore: item.scores?.home?.total ?? item.scores?.home?.points ?? '',
    awayScore: item.scores?.away?.total ?? item.scores?.away?.points ?? '',
    status: mapStatus(item.status?.short, requestedStatus),
    statusShort: item.status?.short,
    date: item.date || item.time,
    venue: item.venue || item.arena?.name || '',
    league: item.league?.name || item.competition?.name || '',
    leagueLogo: item.league?.logo,
    homeTeamLogo: item.teams?.home?.logo,
    awayTeamLogo: item.teams?.away?.logo,
    elapsed: item.status?.timer || item.status?.elapsed,
  };
}

function mapStatus(shortStatus, requestedStatus) {
  if (!shortStatus) return requestedStatus || 'upcoming';
  const live = ['1H', '2H', 'HT', 'ET', 'BT', 'PT', 'Q1', 'Q2', 'Q3', 'Q4', 'OT', 'LIVE', 'IN'];
  const finished = ['FT', 'AET', 'PEN', 'AOT', 'AP', 'POST'];
  if (live.includes(shortStatus)) return 'live';
  if (finished.includes(shortStatus)) return 'completed';
  return 'upcoming';
}
