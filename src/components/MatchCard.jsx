import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Unified MatchCard – renders both Cricket and Football matches
 * using the normalized shape from apiService.js.
 */
const MatchCard = ({ match, sport, compact = false }) => {
  const { isDark } = useTheme();
  const sportId = sport || match?.sport || 'cricket';

  if (!match) return null;

  // ─── helpers ──────────────────────────────────────────────
  const statusColors = {
    live:      { bg: 'bg-red-500/10', text: 'text-red-500', dot: 'bg-red-500' },
    upcoming:  { bg: 'bg-blue-500/10', text: 'text-blue-500', dot: 'bg-blue-500' },
    completed: { bg: 'bg-gray-500/10', text: 'text-gray-500', dot: 'bg-gray-500' },
  };
  const sc = statusColors[match.status] || statusColors.upcoming;

  const homeName = match.homeTeam?.name || match.homeTeam || 'TBA';
  const awayName = match.awayTeam?.name || match.awayTeam || 'TBA';
  const homeLogo = match.homeTeam?.logo || match.homeTeamLogo || '';
  const awayLogo = match.awayTeam?.logo || match.awayTeamLogo || '';
  const homeScore = match.score?.home ?? match.homeScore ?? '';
  const awayScore = match.score?.away ?? match.awayScore ?? '';

  // ─── Date / time formatting ───────────────────────────────
  const formatRelativeDate = (d) => {
    if (!d) return '';
    try {
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return '';
      const now = new Date();

      // Strip time for day comparison
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const matchDay = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
      const diffDays = Math.round((matchDay - today) / (1000 * 60 * 60 * 24));

      const time = dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

      if (diffDays === 0) return `Today, ${time}`;
      if (diffDays === 1) return `Tomorrow, ${time}`;
      if (diffDays === -1) return `Yesterday, ${time}`;
      if (diffDays > 1 && diffDays <= 6) {
        const day = dt.toLocaleDateString('en-IN', { weekday: 'long' });
        return `${day}, ${time}`;
      }

      // Older / further away dates
      return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: dt.getFullYear() !== now.getFullYear() ? 'numeric' : undefined }) + `, ${time}`;
    } catch { return ''; }
  };

  const dateStr = formatRelativeDate(match.date || match.dateTimeGMT);

  // ─── Compact mode (used in tickers / small lists) ─────────
  if (compact) {
    return (
      <Link
        to={`/sport/${sportId}/match/${match.id}`}
        state={{ match }}
        className={`block py-3 px-4 rounded-lg ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} transition-colors`}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-lg">{match.sportIcon || (sportId === 'cricket' ? '🏏' : '⚽')}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {homeName} vs {awayName}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              {match.status === 'live' && (homeScore || awayScore) && (
                <span className="text-xs font-semibold">{homeScore} • {awayScore}</span>
              )}
              {dateStr && (
                <span className={`text-[11px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{dateStr}</span>
              )}
            </div>
          </div>
          <span className={`shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${sc.bg} ${sc.text}`}>
            {match.status === 'live' && <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${sc.dot}`} />}
            {match.status}
          </span>
        </div>
      </Link>
    );
  }

  // ─── Full card ────────────────────────────────────────────
  return (
    <div
      className={`group relative overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-lg ${
        isDark
          ? 'bg-gray-800/80 border-gray-700/60 hover:border-gray-600'
          : 'bg-white border-gray-200 hover:border-gray-300'
      } ${match.status === 'live' ? (isDark ? 'ring-1 ring-red-500/30' : 'ring-1 ring-red-400/20') : ''}`}
    >
      {/* Top bar: league / match type + status badge */}
      <div className={`flex items-center justify-between px-5 py-3 border-b ${isDark ? 'border-gray-700/50' : 'border-gray-100'}`}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base">{match.sportIcon || (sportId === 'cricket' ? '🏏' : '⚽')}</span>
          <span className={`text-xs font-medium truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {match.league || match.matchType || sportId.charAt(0).toUpperCase() + sportId.slice(1)}
          </span>
        </div>
        <span className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${sc.bg} ${sc.text}`}>
          {match.status === 'live' && <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${sc.dot}`} />}
          {match.status}
        </span>
      </div>

      {/* Date/time bar */}
      {dateStr && (
        <div className={`px-5 py-1.5 flex items-center gap-1.5 ${isDark ? 'bg-gray-900/30' : 'bg-gray-50/80'}`}>
          <svg className={`w-3.5 h-3.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {dateStr}
          </span>
          {match.status === 'live' && match.elapsed && (
            <span className="text-xs font-bold text-red-500 ml-auto">{match.elapsed}'</span>
          )}
        </div>
      )}

      {/* Teams + scores */}
      <div className="px-5 py-4 space-y-3">
        {/* Home team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {homeLogo ? (
              <img src={homeLogo} alt={homeName} className="w-7 h-7 rounded-full object-cover shrink-0"
                onError={(e) => { e.target.style.display = 'none'; }} />
            ) : (
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                {(homeName || '?')[0]}
              </div>
            )}
            <span className="font-semibold text-sm truncate">{homeName}</span>
          </div>
          {(homeScore !== '' && homeScore !== null && homeScore !== undefined) && (
            <span className="font-bold text-sm tabular-nums ml-2 shrink-0">{homeScore}</span>
          )}
        </div>

        {/* Away team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {awayLogo ? (
              <img src={awayLogo} alt={awayName} className="w-7 h-7 rounded-full object-cover shrink-0"
                onError={(e) => { e.target.style.display = 'none'; }} />
            ) : (
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                {(awayName || '?')[0]}
              </div>
            )}
            <span className="font-semibold text-sm truncate">{awayName}</span>
          </div>
          {(awayScore !== '' && awayScore !== null && awayScore !== undefined) && (
            <span className="font-bold text-sm tabular-nums ml-2 shrink-0">{awayScore}</span>
          )}
        </div>
      </div>

      {/* Status text (e.g. "India needs 42 runs") */}
      {match.statusText && (
        <div className={`px-5 py-2 text-xs font-medium ${sc.text} ${isDark ? 'bg-gray-900/40' : 'bg-gray-50'}`}>
          {match.statusText}
        </div>
      )}

      {/* Footer: venue + detail link */}
      <div className={`flex items-center justify-between px-5 py-3 border-t ${isDark ? 'border-gray-700/50' : 'border-gray-100'}`}>
        <span className={`text-xs truncate max-w-[60%] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          {match.venue ? `📍 ${match.venue}` : ''}
        </span>
        <Link
          to={`/sport/${sportId}/match/${match.id}`}
          state={{ match }}
          className="text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors"
        >
          Details →
        </Link>
      </div>
    </div>
  );
};

export default MatchCard;
