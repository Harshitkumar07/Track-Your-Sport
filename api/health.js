// Simple Vercel Serverless Function for Health Check
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      platform: 'vercel-serverless',
      version: '1.0.0',
      apis: {
        cricapi: {
          status: 'configured',
          hasKey: !!process.env.CRICAPI_KEY
        },
        apisports: {
          status: 'configured', 
          hasKey: !!process.env.APISPORTS_KEY
        }
      }
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
