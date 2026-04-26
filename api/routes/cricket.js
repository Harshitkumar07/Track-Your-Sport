const express = require('express');
const CricketService = require('../services/cricketService');
const { cacheMiddleware } = require('../utils/cache');

const router = express.Router();
const cricketService = new CricketService();

// Live matches - cache for 15 seconds
router.get('/live', cacheMiddleware(15), async (req, res) => {
  try {
    const matches = await cricketService.getLiveMatches();
    res.json({
      success: true,
      data: matches,
      count: matches.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching live cricket matches:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch live cricket matches',
      message: error.message
    });
  }
});

// Upcoming matches - cache for 2 minutes
router.get('/upcoming', cacheMiddleware(120), async (req, res) => {
  try {
    const matches = await cricketService.getUpcomingMatches();
    res.json({
      success: true,
      data: matches,
      count: matches.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching upcoming cricket matches:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch upcoming cricket matches',
      message: error.message
    });
  }
});

// Recent matches - cache for 5 minutes
router.get('/recent', cacheMiddleware(300), async (req, res) => {
  try {
    const matches = await cricketService.getRecentMatches();
    res.json({
      success: true,
      data: matches,
      count: matches.length,
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
});

// Cricket series - cache for 5 minutes
router.get('/series', cacheMiddleware(300), async (req, res) => {
  try {
    const series = await cricketService.getSeries();
    res.json({
      success: true,
      data: series,
      count: series.length,
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
});

// Match details by ID
router.get('/match/:id', cacheMiddleware(30), async (req, res) => {
  try {
    const { id } = req.params;
    const match = await cricketService.getMatchDetails(id);
    
    if (!match) {
      return res.status(404).json({
        success: false,
        error: 'Match not found'
      });
    }

    res.json({
      success: true,
      data: match,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching cricket match details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cricket match details',
      message: error.message
    });
  }
});

module.exports = router;
