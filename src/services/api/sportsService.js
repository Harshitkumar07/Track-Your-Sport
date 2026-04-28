/**
 * Unified Sports API Service
 * Re-exports from the central apiService for backward compatibility.
 */

import apiService from '../apiService';

export const sportsService = apiService;

// Re-export common functions
export const getCricketLive     = () => apiService.getCricketLive();
export const getCricketUpcoming = () => apiService.getCricketUpcoming();
export const getCricketRecent   = () => apiService.getCricketRecent();
export const getCricketSeries   = () => apiService.getCricketSeries();
export const getFootballLive    = () => apiService.getFootballLive();
export const getFootballUpcoming = () => apiService.getFootballUpcoming();
export const getAllLiveMatches   = () => apiService.getDashboardData().then(d => d.allLive);
export const getSportsList      = () => Promise.resolve([
  { id: 'cricket',  name: 'Cricket',  icon: '🏏', endpoint: 'cricket' },
  { id: 'football', name: 'Football', icon: '⚽', endpoint: 'football' },
]);
export const getDashboardData   = () => apiService.getDashboardData();

export default sportsService;
