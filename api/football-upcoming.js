// Vercel Serverless Function for Upcoming Football Matches
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

    // Get today and next 7 days
    const today = new Date();
    const endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const from = today.toISOString().split('T')[0];
    const to = endDate.toISOString().split('T')[0];

    console.log('Fetching upcoming football matches...');
    const response = await fetch(`https://v3.football.api-sports.io/fixtures?from=${from}&to=${to}&timezone=Asia/Kolkata`, {
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
    
    // Filter for upcoming matches only and limit to 20
    const upcomingMatches = matches
      .filter(m => ['TBD', 'NS'].includes(m.fixture?.status?.short))
      .slice(0, 20);
    
    // Normalize matches to standard format
    const normalizedMatches = upcomingMatches.map(match => ({
      id: match.fixture?.id,
      sport: 'football',
      name: `${match.teams?.home?.name} vs ${match.teams?.away?.name}`,
      homeTeam: match.teams?.home?.name,
      awayTeam: match.teams?.away?.name,
      status: 'upcoming',
      date: match.fixture?.date,
      venue: match.fixture?.venue?.name,
      league: match.league?.name,
      leagueLogo: match.league?.logo,
      homeTeamLogo: match.teams?.home?.logo,
      awayTeamLogo: match.teams?.away?.logo,
      isLive: false
    }));

    res.status(200).json({
      success: true,
      data: normalizedMatches,
      count: normalizedMatches.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching upcoming football matches:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch upcoming football matches',
      message: error.message
    });
  }
}
