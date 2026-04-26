// Vercel Serverless Function for Cricket Series
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

    console.log('Fetching cricket series...');
    const response = await fetch(`https://api.cricapi.com/v1/series?apikey=${apiKey}&offset=0`);
    
    if (!response.ok) {
      throw new Error(`CricAPI request failed: ${response.status}`);
    }

    const data = await response.json();
    const series = Array.isArray(data) ? data : data.data || [];
    
    // Filter active series
    const activeSeries = series.filter(s => !s.matches || s.matches > 0).slice(0, 20);

    res.status(200).json({
      success: true,
      data: activeSeries,
      count: activeSeries.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching cricket series:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cricket series',
      message: error.message
    });
  }
}
