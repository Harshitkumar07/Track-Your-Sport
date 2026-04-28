import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '../contexts/ThemeContext';
import { SUPPORTED_SPORTS, APP_CONFIG } from '../config/routes';
import apiService from '../services/apiService';

/**
 * MatchDetail – shows detailed match info.
 *
 * API-efficient approach:
 * 1. If navigated via MatchCard → match data is passed via React Router state (0 API calls)
 * 2. If direct URL access → fetches the sport's live+upcoming data (uses cache if warm)
 *    and finds the match by ID in the results.
 * 3. No extra per-match API calls needed.
 */
const MatchDetail = () => {
  const { sport, matchId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const [match, setMatch] = useState(location.state?.match || null);
  const [loading, setLoading] = useState(!match);
  const [activeTab, setActiveTab] = useState('overview');

  // Find the sport config
  const sportConfig = SUPPORTED_SPORTS.find(s => s.id === sport);

  // Fetch match data if not passed via state
  const fetchMatch = useCallback(async () => {
    if (match) return; // Already have data from router state
    setLoading(true);
    try {
      // Try to find in live, upcoming, and recent data (uses cache)
      const [live, upcoming, recent] = await Promise.allSettled([
        apiService.getSportData(sport, 'live'),
        apiService.getSportData(sport, 'upcoming'),
        apiService.getSportData(sport, 'recent'),
      ]);

      const allMatches = [
        ...(live.status === 'fulfilled' ? live.value : []),
        ...(upcoming.status === 'fulfilled' ? upcoming.value : []),
        ...(recent.status === 'fulfilled' ? recent.value : []),
      ];

      const found = allMatches.find(m => m.id === matchId || String(m.id) === String(matchId));
      if (found) {
        setMatch(found);
      }
    } catch (err) {
      console.error('Failed to fetch match:', err);
    } finally {
      setLoading(false);
    }
  }, [match, matchId, sport]);

  useEffect(() => {
    fetchMatch();
  }, [fetchMatch]);

  // Redirect if sport is invalid
  if (!sportConfig) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Sport not found</p>
          <button onClick={() => navigate('/explore')} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            Explore Sports
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Loading match details…</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-xl font-bold mb-2">Match Not Found</p>
          <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            This match may have ended or the data is no longer available.
          </p>
          <button
            onClick={() => navigate(`/sport/${sport}`)}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
          >
            Browse {sportConfig.name} Matches
          </button>
        </div>
      </div>
    );
  }

  // Extract data from the normalized match shape
  const homeName = match.homeTeam?.name || match.homeTeam || 'TBA';
  const awayName = match.awayTeam?.name || match.awayTeam || 'TBA';
  const homeLogo = match.homeTeam?.logo || '';
  const awayLogo = match.awayTeam?.logo || '';
  const homeScore = match.score?.home ?? match.homeScore ?? '';
  const awayScore = match.score?.away ?? match.awayScore ?? '';
  const isLive = match.status === 'live';
  const isCompleted = match.status === 'completed';
  const isUpcoming = match.status === 'upcoming';

  // Format date
  const formatDate = (d) => {
    if (!d) return 'TBA';
    try {
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return 'TBA';
      return dt.toLocaleString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
      });
    } catch { return 'TBA'; }
  };

  // Cricket-specific details from raw data
  const raw = match.raw || {};
  const cricketScoreDetails = sport === 'cricket' && raw.score ? raw.score : null;

  const tabs = ['overview'];
  if (sport === 'cricket' && cricketScoreDetails) tabs.push('scorecard');
  if (match.statusText || isLive) tabs.push('updates');

  return (
    <>
      <Helmet>
        <title>{homeName} vs {awayName} – {sportConfig.name} | {APP_CONFIG.appName}</title>
        <meta name="description" content={`${isLive ? 'Live' : ''} ${sportConfig.name} match: ${homeName} vs ${awayName}. Get scores, updates and details on ${APP_CONFIG.appName}.`} />
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-6 py-6">
        {/* Back button */}
        <button
          onClick={() => navigate(`/sport/${sport}`)}
          className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
            isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to {sportConfig.name}
        </button>

        {/* ═══ Match Header Card ═══ */}
        <div className={`rounded-2xl overflow-hidden border ${isDark ? 'bg-gray-800/80 border-gray-700/60' : 'bg-white border-gray-200'} shadow-lg`}>
          {/* Top gradient bar */}
          <div className={`h-1.5 bg-gradient-to-r ${sportConfig.gradient}`} />

          {/* Match meta row */}
          <div className={`flex items-center justify-between px-6 py-3 border-b ${isDark ? 'border-gray-700/50' : 'border-gray-100'}`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">{sportConfig.icon}</span>
              <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {match.league || match.matchType || sportConfig.name}
              </span>
            </div>
            <StatusBadge status={match.status} />
          </div>

          {/* Score display */}
          <div className="px-6 py-8">
            <div className="grid grid-cols-3 items-center gap-4">
              {/* Home team */}
              <div className="text-center">
                <TeamDisplay name={homeName} logo={homeLogo} isDark={isDark} />
                {(homeScore !== '' && homeScore !== null && homeScore !== undefined) && (
                  <p className="text-2xl md:text-3xl font-bold mt-3">{homeScore}</p>
                )}
              </div>

              {/* VS / Time */}
              <div className="text-center">
                {isUpcoming ? (
                  <div>
                    <p className={`text-xs uppercase tracking-widest font-semibold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Starts at</p>
                    <p className="text-lg font-bold mt-1">
                      {new Date(match.date || match.dateTimeGMT).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </p>
                  </div>
                ) : (
                  <div className={`text-3xl font-black ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>VS</div>
                )}
                {isLive && match.elapsed && (
                  <p className="text-sm text-red-500 font-bold mt-2">{match.elapsed}'</p>
                )}
              </div>

              {/* Away team */}
              <div className="text-center">
                <TeamDisplay name={awayName} logo={awayLogo} isDark={isDark} />
                {(awayScore !== '' && awayScore !== null && awayScore !== undefined) && (
                  <p className="text-2xl md:text-3xl font-bold mt-3">{awayScore}</p>
                )}
              </div>
            </div>

            {/* Status text */}
            {match.statusText && (
              <div className={`mt-6 text-center rounded-xl px-4 py-3 ${
                isLive ? 'bg-red-500/10 text-red-500' :
                isCompleted ? (isDark ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-50 text-gray-600') :
                'bg-blue-500/10 text-blue-500'
              }`}>
                <p className="text-sm font-semibold">{match.statusText}</p>
              </div>
            )}
          </div>
        </div>

        {/* ═══ Tabs ═══ */}
        <div className={`flex gap-1 p-1 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all ${
                activeTab === tab
                  ? `${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900 shadow-sm'}`
                  : `${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
              }`}
            >
              {tab}
              {tab === 'updates' && isLive && (
                <span className="ml-2 inline-block w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </div>

        {/* ═══ Tab Content ═══ */}
        <div className={`rounded-2xl border p-6 ${isDark ? 'bg-gray-800/80 border-gray-700/60' : 'bg-white border-gray-200'} shadow-sm`}>

          {/* ── Overview Tab ── */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold">Match Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InfoRow label="Competition" value={match.league || match.matchType || sportConfig.name} isDark={isDark} />
                <InfoRow label="Sport" value={sportConfig.name} isDark={isDark} />
                <InfoRow label="Venue" value={match.venue || 'Not specified'} isDark={isDark} />
                <InfoRow label="Date & Time" value={formatDate(match.date || match.dateTimeGMT)} isDark={isDark} />
                <InfoRow label="Status" value={match.status?.toUpperCase() || 'Unknown'} isDark={isDark} />
                {match.matchType && <InfoRow label="Match Type" value={match.matchType} isDark={isDark} />}
              </div>

              {/* Cricket-specific info from raw data */}
              {sport === 'cricket' && raw && (
                <div className="space-y-4 mt-6">
                  {raw.matchType && (
                    <InfoRow label="Format" value={raw.matchType.toUpperCase()} isDark={isDark} />
                  )}
                </div>
              )}

              {/* Teams */}
              <div className="mt-6">
                <h3 className="text-lg font-bold mb-4">Teams</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TeamCard
                    name={homeName}
                    logo={homeLogo}
                    short={match.homeTeam?.short}
                    score={homeScore}
                    label="Home"
                    isDark={isDark}
                  />
                  <TeamCard
                    name={awayName}
                    logo={awayLogo}
                    short={match.awayTeam?.short}
                    score={awayScore}
                    label="Away"
                    isDark={isDark}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Scorecard Tab (Cricket only) ── */}
          {activeTab === 'scorecard' && cricketScoreDetails && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold">Scorecard</h3>
              {cricketScoreDetails.map((innings, i) => (
                <div key={i} className={`rounded-xl p-5 ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <h4 className="font-semibold mb-3">{innings.inning || `Innings ${i + 1}`}</h4>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <p className={`text-xs uppercase ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Runs</p>
                      <p className="text-2xl font-bold">{innings.r ?? '-'}</p>
                    </div>
                    <div>
                      <p className={`text-xs uppercase ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Wickets</p>
                      <p className="text-2xl font-bold">{innings.w ?? '-'}</p>
                    </div>
                    <div>
                      <p className={`text-xs uppercase ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Overs</p>
                      <p className="text-2xl font-bold">{innings.o ?? '-'}</p>
                    </div>
                    <div>
                      <p className={`text-xs uppercase ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Run Rate</p>
                      <p className="text-2xl font-bold">
                        {innings.r && innings.o ? (innings.r / parseFloat(innings.o)).toFixed(2) : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Updates Tab ── */}
          {activeTab === 'updates' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Match Updates</h3>
              {match.statusText ? (
                <div className={`rounded-xl p-5 ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-3">
                    <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isLive ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      {isLive ? '🔴' : 'ℹ️'}
                    </span>
                    <div>
                      <p className="font-semibold">{isLive ? 'Live Update' : 'Match Result'}</p>
                      <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{match.statusText}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {isLive ? 'Waiting for updates...' : isUpcoming ? 'Updates will appear when the match starts.' : 'No updates available for this match.'}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Quick navigation */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            to={`/sport/${sport}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All {sportConfig.name} Matches
          </Link>
          <Link
            to="/explore"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Explore Sports
          </Link>
        </div>
      </div>
    </>
  );
};

// ─────────────── Sub-components ───────────────

const StatusBadge = ({ status }) => {
  const styles = {
    live:      'bg-red-500/10 text-red-500',
    upcoming:  'bg-blue-500/10 text-blue-500',
    completed: 'bg-gray-500/10 text-gray-500',
  };
  return (
    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${styles[status] || styles.upcoming}`}>
      {status === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
      {status}
    </span>
  );
};

const TeamDisplay = ({ name, logo, isDark }) => (
  <div className="flex flex-col items-center gap-2">
    {logo ? (
      <img src={logo} alt={name} className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling && (e.target.nextSibling.style.display = 'flex'); }} />
    ) : null}
    <div className={`${logo ? 'hidden' : 'flex'} w-16 h-16 md:w-20 md:h-20 rounded-full items-center justify-center text-2xl font-bold ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500'}`}>
      {(name || '?')[0]}
    </div>
    <p className="font-bold text-sm md:text-base text-center leading-tight">{name}</p>
  </div>
);

const InfoRow = ({ label, value, isDark }) => (
  <div className={`rounded-lg px-4 py-3 ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
    <p className={`text-xs uppercase tracking-wider font-medium mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
    <p className="font-semibold text-sm">{value}</p>
  </div>
);

const TeamCard = ({ name, logo, short, score, label, isDark }) => (
  <div className={`rounded-xl p-5 ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} text-center`}>
    <p className={`text-xs uppercase tracking-wider font-medium mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
    {logo ? (
      <img src={logo} alt={name} className="w-14 h-14 rounded-full mx-auto mb-2 object-cover"
        onError={(e) => { e.target.style.display = 'none'; }} />
    ) : (
      <div className={`w-14 h-14 rounded-full mx-auto mb-2 flex items-center justify-center text-xl font-bold ${isDark ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-500'}`}>
        {(name || '?')[0]}
      </div>
    )}
    <p className="font-bold">{name}</p>
    {short && <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{short}</p>}
    {(score !== '' && score !== null && score !== undefined) && (
      <p className="text-xl font-bold mt-2">{score}</p>
    )}
  </div>
);

export default MatchDetail;
