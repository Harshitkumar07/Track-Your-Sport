import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '../contexts/ThemeContext';
import MatchCard from '../components/MatchCard';
import { SUPPORTED_SPORTS, APP_CONFIG } from '../config/routes';
import apiService from '../services/apiService';

const MatchList = () => {
  const { sport } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState({ live: [], upcoming: [], recent: [] });

  // Find sport config from array
  const sportConfig = SUPPORTED_SPORTS.find(s => s.id === sport);

  useEffect(() => {
    if (!sportConfig) navigate('/explore');
  }, [sportConfig, navigate]);

  // Fetch matches using the unified apiService
  const fetchMatches = useCallback(async () => {
    if (!sportConfig) return;
    setLoading(true);
    try {
      // Fetch live + upcoming + recent for ALL sports
      const [live, upcoming, recent] = await Promise.allSettled([
        apiService.getSportData(sport, 'live'),
        apiService.getSportData(sport, 'upcoming'),
        apiService.getSportData(sport, 'recent'),
      ]);
      setMatches({
        live:     live.status === 'fulfilled'     ? live.value     : [],
        upcoming: upcoming.status === 'fulfilled' ? upcoming.value : [],
        recent:   recent.status === 'fulfilled'   ? recent.value   : [],
      });
    } catch (err) {
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  }, [sport, sportConfig]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  if (!sportConfig) return null;

  // Combine & filter
  const allMatches = [
    ...matches.live.map(m => ({ ...m, _status: m.status || 'live' })),
    ...matches.upcoming.map(m => ({ ...m, _status: m.status || 'upcoming' })),
    ...matches.recent.map(m => ({ ...m, _status: m.status || 'completed' })),
  ];

  const filtered = allMatches
    .filter(m => {
      if (filter === 'all') return true;
      return (m.status || m._status) === filter;
    })
    .filter(m => {
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      const home = (m.homeTeam?.name || m.homeTeam || '').toLowerCase();
      const away = (m.awayTeam?.name || m.awayTeam || '').toLowerCase();
      const venue = (m.venue || '').toLowerCase();
      const league = (m.league || '').toLowerCase();
      return home.includes(q) || away.includes(q) || venue.includes(q) || league.includes(q);
    });

  const liveCount = matches.live.length;
  const upcomingCount = matches.upcoming.length;
  const recentCount = matches.recent.length;

  return (
    <>
      <Helmet>
        <title>{sportConfig.name} Matches - {APP_CONFIG.appName}</title>
        <meta name="description" content={`Live scores and updates for ${sportConfig.name} matches`} />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{sportConfig.icon}</span>
            <div>
              <h1 className="text-2xl font-bold">{sportConfig.name} Matches</h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Live scores, upcoming fixtures & recent results
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/explore')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            ← All Sports
          </button>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-3">
          <div className={`rounded-xl p-4 text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Live Now</p>
            <p className="text-xl font-bold text-red-500">{liveCount}</p>
          </div>
          <div className={`rounded-xl p-4 text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Upcoming</p>
            <p className="text-xl font-bold text-blue-500">{upcomingCount}</p>
          </div>
          <div className={`rounded-xl p-4 text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Recent</p>
            <p className="text-xl font-bold">{recentCount}</p>
          </div>
        </div>

        {/* Filters */}
        <div className={`flex flex-col sm:flex-row gap-3 p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <input
            type="text"
            placeholder="Search teams, venues…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`flex-1 px-4 py-2 rounded-lg text-sm ${
              isDark ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-gray-900 placeholder-gray-500'
            }`}
          />
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'all',       label: 'All' },
              { key: 'live',      label: 'Live' },
              { key: 'upcoming',  label: 'Upcoming' },
              { key: 'completed', label: 'Completed' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  filter === f.key
                    ? 'bg-blue-500 text-white'
                    : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {f.label}
                {f.key === 'live' && liveCount > 0 && (
                  <span className="ml-1 w-1.5 h-1.5 inline-block rounded-full bg-red-500 animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Match grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((m) => (
              <MatchCard key={`${m.sport || sport}-${m.id}`} match={m} sport={sport} />
            ))}
          </div>
        ) : (
          <div className={`text-center py-16 rounded-xl ${isDark ? 'bg-gray-800/40' : 'bg-gray-50'}`}>
            <span className="text-5xl block mb-4">{sportConfig.icon}</span>
            <p className="text-lg font-semibold mb-1">No matches found</p>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {searchTerm ? 'Try adjusting your search' : 'Check back later for upcoming fixtures'}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default MatchList;
