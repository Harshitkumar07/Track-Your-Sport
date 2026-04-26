// Vercel Serverless Function for Live Football Matches
const fetch = require('node-fetch');

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.APISPORTS_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    console.log('Fetching live football matches...');
    const response = await fetch('https://v3.football.api-sports.io/fixtures?live=all', {
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'v3.football.api-sports.io'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API-SPORTS request failed: ${response.status}`);
    }

    const data = await response.json();
    const matches = data.response || [];
    
    // Normalize matches to standard format
    const normalizedMatches = matches.map(match => ({
      id: match.fixture?.id,
      sport: 'football',
      name: `${match.teams?.home?.name} vs ${match.teams?.away?.name}`,
      homeTeam: match.teams?.home?.name,
      awayTeam: match.teams?.away?.name,
      homeScore: match.goals?.home,
      awayScore: match.goals?.away,
      status: 'live',
      date: match.fixture?.date,
      venue: match.fixture?.venue?.name,
      league: match.league?.name,
      leagueLogo: match.league?.logo,
      homeTeamLogo: match.teams?.home?.logo,
      awayTeamLogo: match.teams?.away?.logo,
      time: match.fixture?.status?.elapsed,
      isLive: true
    }));

    res.status(200).json({
      success: true,
      data: normalizedMatches,
      count: normalizedMatches.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching live football matches:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch live football matches',
      message: error.message
    });
  }
}
