// Vercel Serverless Function for Cricket Recent Matches
const fetch = require('node-fetch');

export default async function handler(req, res) {
  // Enable CORS - comprehensive headers
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
    const apiKey = process.env.CRICAPI_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    console.log('Fetching recent cricket matches...');
    const response = await fetch(`https://api.cricapi.com/v1/matches?apikey=${apiKey}&offset=0`);
    
    if (!response.ok) {
      throw new Error(`CricAPI request failed: ${response.status}`);
    }

    const data = await response.json();
    const matches = Array.isArray(data) ? data : data.data || [];
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    const recentMatches = matches.filter(match => {
      if (!match.matchEnded) return false;
      if (!match.dateTimeGMT) return false;
      
      const matchTime = new Date(match.dateTimeGMT).getTime();
      return matchTime > sevenDaysAgo;
    }).slice(0, 20);

    res.status(200).json({
      success: true,
      data: recentMatches,
      count: recentMatches.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching recent cricket matches:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent cricket matches',
      message: error.message
    });
  }
}
