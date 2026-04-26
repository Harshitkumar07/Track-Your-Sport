const express = require('express');
const SportsService = require('../_services/sportsService');
const { cacheMiddleware } = require('../_utils/cache');

const router = express.Router();
const sportsService = new SportsService();

// List all supported sports
router.get('/list', cacheMiddleware(3600), async (req, res) => {
  try {
    const sports = await sportsService.getSupportedSports();
    res.json({
      success: true,
      data: sports,
      count: sports.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching sports list:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sports list',
      message: error.message
    });
  }
});

// Live matches for a specific sport
router.get('/:sport/live', cacheMiddleware(15), async (req, res) => {
  try {
    const { sport } = req.params;
    const matches = await sportsService.getLiveMatches(sport);
    res.json({
      success: true,
      data: matches,
      sport: sport,
      count: matches.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error fetching live ${req.params.sport} matches:`, error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch live ${req.params.sport} matches`,
      message: error.message
    });
  }
});

// Upcoming matches for a specific sport
router.get('/:sport/upcoming', cacheMiddleware(120), async (req, res) => {
  try {
    const { sport } = req.params;
    const matches = await sportsService.getUpcomingMatches(sport);
    res.json({
      success: true,
      data: matches,
      sport: sport,
      count: matches.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error fetching upcoming ${req.params.sport} matches:`, error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch upcoming ${req.params.sport} matches`,
      message: error.message
    });
  }
});

// Recent results for a specific sport
router.get('/:sport/recent', cacheMiddleware(300), async (req, res) => {
  try {
    const { sport } = req.params;
    const matches = await sportsService.getRecentMatches(sport);
    res.json({
      success: true,
      data: matches,
      sport: sport,
      count: matches.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error fetching recent ${req.params.sport} matches:`, error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch recent ${req.params.sport} matches`,
      message: error.message
    });
  }
});

// Leagues for a specific sport
router.get('/:sport/leagues', cacheMiddleware(3600), async (req, res) => {
  try {
    const { sport } = req.params;
    const leagues = await sportsService.getLeagues(sport);
    res.json({
      success: true,
      data: leagues,
      sport: sport,
      count: leagues.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error fetching ${req.params.sport} leagues:`, error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch ${req.params.sport} leagues`,
      message: error.message
    });
  }
});

// Combined live matches (all sports)
router.get('/matches/live', cacheMiddleware(15), async (req, res) => {
  try {
    const allMatches = await sportsService.getAllLiveMatches();
    res.json({
      success: true,
      data: allMatches,
      count: allMatches.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching all live matches:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch all live matches',
      message: error.message
    });
  }
});

// Popular sports data
router.get('/popular', cacheMiddleware(300), async (req, res) => {
  try {
    const popularSports = await sportsService.getPopularSports();
    res.json({
      success: true,
      data: popularSports,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching popular sports:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch popular sports',
      message: error.message
    });
  }
});

module.exports = router;
