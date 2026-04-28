import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Clock, TrendingUp, RefreshCw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import MatchCard from './MatchCard';
import apiService, { DASHBOARD_REFRESH_INTERVAL } from '../services/apiService';
import { SUPPORTED_SPORTS, FEATURED_SPORTS, APP_CONFIG } from '../config/routes';

/**
 * Sports Dashboard – shows live/upcoming data for all supported sports.
 * Featured sports (cricket, football, basketball) are fetched on load.
 * Other sports are lazy-loaded when user selects them.
 */
const SportsDashboard = () => {
  const { isDark } = useTheme();
  const [selectedSport, setSelectedSport] = useState('cricket');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sportData, setSportData] = useState({}); // { [sportId]: { live: [], upcoming: [] } }
  const [lastUpdated, setLastUpdated] = useState(null);

  // Initial load – fetch featured sports live data
  const fetchFeatured = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const results = await Promise.allSettled(
        FEATURED_SPORTS.map(sp => apiService.getSportData(sp.id, 'live'))
      );
      const newData = {};
      FEATURED_SPORTS.forEach((sp, i) => {
        newData[sp.id] = {
          live: results[i].status === 'fulfilled' ? results[i].value : [],
          upcoming: sportData[sp.id]?.upcoming || [],
        };
      });
      setSportData(prev => ({ ...prev, ...newData }));
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [sportData]);

  useEffect(() => {
    fetchFeatured(true);
    const id = setInterval(() => fetchFeatured(false), DASHBOARD_REFRESH_INTERVAL);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lazy-load data for a sport when selected
  const loadSport = useCallback(async (sportId) => {
    if (sportData[sportId]?.live?.length > 0 || sportData[sportId]?.upcoming?.length > 0) return;

    try {
      const [live, upcoming] = await Promise.allSettled([
        apiService.getSportData(sportId, 'live'),
        apiService.getSportData(sportId, 'upcoming'),
      ]);
      setSportData(prev => ({
        ...prev,
        [sportId]: {
          live: live.status === 'fulfilled' ? live.value : [],
          upcoming: upcoming.status === 'fulfilled' ? upcoming.value : [],
        },
      }));
    } catch (err) {
      console.warn(`Failed to load ${sportId}:`, err);
    }
  }, [sportData]);

  // Load upcoming for current sport
  useEffect(() => {
    loadSport(selectedSport);
  }, [selectedSport, loadSport]);

  const handleRefresh = async () => {
    setRefreshing(true);
    apiService.clearCache();
    setSportData({});
    await fetchFeatured(false);
    await loadSport(selectedSport);
    setRefreshing(false);
  };

  const current = sportData[selectedSport] || { live: [], upcoming: [] };
  const allLiveCount = Object.values(sportData).reduce((n, d) => n + (d.live?.length || 0), 0);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Loading Dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{APP_CONFIG.appName} Dashboard</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Live scores across {SUPPORTED_SPORTS.length} sports
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{lastUpdated.toLocaleTimeString()}</span>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } ${refreshing ? 'opacity-50 cursor-wait' : ''}`}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Trophy} title="Live Now" value={allLiveCount} sub="All sports" color="red" isDark={isDark} />
        <StatCard icon={Clock} title="Upcoming" value={current.upcoming.length} sub={`${selectedSport} fixtures`} color="blue" isDark={isDark} />
        <StatCard icon={TrendingUp} title="Sports" value={SUPPORTED_SPORTS.length} sub="Available" color="green" isDark={isDark} />
      </div>

      {/* Sport selector – scrollable */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {SUPPORTED_SPORTS.map((sp) => {
          const isActive = selectedSport === sp.id;
          const liveCount = sportData[sp.id]?.live?.length || 0;
          return (
            <button
              key={sp.id}
              onClick={() => setSelectedSport(sp.id)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? `bg-gradient-to-r ${sp.gradient} text-white shadow-lg`
                  : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <span>{sp.icon}</span>
              <span className="hidden sm:inline">{sp.name}</span>
              {liveCount > 0 && (
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isActive ? 'bg-white/20' : 'bg-red-500/10 text-red-500'}`}>
                  {liveCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Live */}
      <div>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          Live {SUPPORTED_SPORTS.find(s => s.id === selectedSport)?.name || ''} Matches
        </h2>
        {current.live.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {current.live.map(m => <MatchCard key={m.id} match={m} sport={selectedSport} />)}
          </div>
        ) : (
          <EmptyState isDark={isDark} message={`No live ${selectedSport} matches right now`} />
        )}
      </div>

      {/* Upcoming */}
      <div>
        <h2 className="text-lg font-bold mb-4">📅 Upcoming Fixtures</h2>
        {current.upcoming.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {current.upcoming.slice(0, 9).map(m => <MatchCard key={m.id} match={m} sport={selectedSport} />)}
          </div>
        ) : (
          <EmptyState isDark={isDark} message={`No upcoming ${selectedSport} fixtures loaded yet`} />
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, title, value, sub, color, isDark }) => {
  const cl = {
    red:   isDark ? 'bg-red-500/10 text-red-400'   : 'bg-red-50 text-red-500',
    blue:  isDark ? 'bg-blue-500/10 text-blue-400'  : 'bg-blue-50 text-blue-500',
    green: isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-500',
  };
  return (
    <div className={`rounded-xl p-5 border ${isDark ? 'bg-gray-800/80 border-gray-700/60' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{sub}</p>
        </div>
        <div className={`p-2.5 rounded-lg ${cl[color]}`}><Icon size={20} /></div>
      </div>
    </div>
  );
};

const EmptyState = ({ isDark, message }) => (
  <div className={`rounded-xl p-8 text-center ${isDark ? 'bg-gray-800/40' : 'bg-gray-50'}`}>
    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{message}</p>
  </div>
);

export default SportsDashboard;
