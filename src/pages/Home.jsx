import React, { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { APP_CONFIG, SUPPORTED_SPORTS } from '../config/routes';
import MatchCard from '../components/MatchCard';
import apiService, { DASHBOARD_REFRESH_INTERVAL } from '../services/apiService';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadData = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const data = await apiService.getDashboardData();
      setDashboard(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(true);
    const id = setInterval(() => loadData(false), DASHBOARD_REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [loadData]);

  const cricketLive     = dashboard?.cricket?.live    || [];
  const footballLive    = dashboard?.football?.live   || [];
  const basketballLive  = dashboard?.basketball?.live || [];
  const allLive         = dashboard?.allLive          || [];

  // Helper to get live count for any sport
  const getLiveCount = (sportId) => {
    if (sportId === 'cricket') return cricketLive.length;
    if (sportId === 'football') return footballLive.length;
    if (sportId === 'basketball') return basketballLive.length;
    return 0;
  };

  // Build live sport entries (only sports with > 0 live matches)
  const liveSportEntries = [
    { id: 'cricket', icon: '🏏', name: 'Cricket', count: cricketLive.length },
    { id: 'football', icon: '⚽', name: 'Football', count: footballLive.length },
    { id: 'basketball', icon: '🏀', name: 'Basketball', count: basketballLive.length },
  ].filter(s => s.count > 0);

  // Scroll to live matches section
  const scrollToLive = () => {
    const el = document.getElementById('live-matches-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <Helmet>
        <title>{APP_CONFIG.appName} – Live Cricket & Football Scores</title>
        <meta name="description" content={APP_CONFIG.appDescription} />
      </Helmet>

      <div className="space-y-10 pb-12">

        {/* ════════════ HERO ════════════ */}
        <section className="relative overflow-hidden rounded-2xl">
          {/* Gradient background */}
          <div className={`absolute inset-0 ${
            isDark
              ? 'bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900'
              : 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600'
          }`} />

          {/* Animated blobs */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-400/10 rounded-full blur-2xl" />

          <div className="relative z-10 px-8 py-14 md:px-12 md:py-20">
            <p className="text-blue-200 text-sm font-semibold tracking-widest uppercase mb-3">
              Live Sports Tracker
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
              {APP_CONFIG.appName}
            </h1>
            <p className="text-lg text-blue-100/80 max-w-xl mb-8">
              {APP_CONFIG.appTagline}. Real-time scores, upcoming fixtures &amp; match details – all in one place.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/explore"
                id="hero-explore-btn"
                className="px-7 py-3 bg-white text-indigo-700 rounded-xl font-semibold shadow-lg shadow-black/10 hover:shadow-xl hover:scale-[1.02] transition-all"
              >
                Explore Sports
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/auth"
                  id="hero-join-btn"
                  className="px-7 py-3 border-2 border-white/40 text-white rounded-xl font-semibold hover:bg-white/10 transition-all"
                >
                  Join Community
                </Link>
              )}
            </div>

            {/* Quick stats strip – clickable, only shows sports with live > 0 */}
            {dashboard && (
              <div className="mt-10 flex flex-wrap gap-6 text-white/70 text-sm">
                {allLive.length > 0 ? (
                  <button
                    onClick={scrollToLive}
                    className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <strong className="text-white">{allLive.length}</strong> live matches
                  </button>
                ) : (
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gray-400" />
                    No live matches right now
                  </span>
                )}

                {liveSportEntries.map(s => (
                  <Link
                    key={s.id}
                    to={`/sport/${s.id}`}
                    className="hover:text-white transition-colors"
                  >
                    {s.icon} {s.name}: <strong className="text-white">{s.count}</strong>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ════════════ LIVE MATCHES ════════════ */}
        <section id="live-matches-section">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              Live Matches
            </h2>
            {lastUpdated && (
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>

          {loading ? (
            <LoadingSkeleton isDark={isDark} count={3} />
          ) : allLive.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allLive.slice(0, 6).map((m) => (
                <MatchCard key={`${m.sport}-${m.id}`} match={m} sport={m.sport} />
              ))}
            </div>
          ) : (
            <EmptyState isDark={isDark} message="No live matches right now – check back soon!" />
          )}
        </section>

        {/* ════════════ CHOOSE YOUR SPORT ════════════ */}
        <section>
          <h2 className="text-2xl font-bold mb-5">Choose Your Sport</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SUPPORTED_SPORTS.map((sp) => {
              const liveCount = getLiveCount(sp.id);
              return (
                <Link
                  key={sp.id}
                  to={`/sport/${sp.id}`}
                  id={`sport-card-${sp.id}`}
                  className={`group relative overflow-hidden rounded-2xl p-7 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                    isDark ? 'bg-gray-800/80 border border-gray-700/60' : 'bg-white border border-gray-200'
                  }`}
                >
                  {/* Gradient accent on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${sp.gradient} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-500`} />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-4xl">{sp.icon}</span>
                      {liveCount > 0 && (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          {liveCount} LIVE
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold mb-1">{sp.name}</h3>
                    <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {sp.description}
                    </p>
                    <span className="inline-flex items-center text-sm font-semibold text-blue-500 group-hover:gap-2 transition-all">
                      Explore {sp.name}
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ════════════ FEATURED BY SPORT ════════════ */}
        <section>
          <h2 className="text-2xl font-bold mb-5">Featured Matches</h2>

          {loading ? (
            <LoadingSkeleton isDark={isDark} count={2} />
          ) : (
            <div className="space-y-8">
              {/* Cricket */}
              {cricketLive.length > 0 && (
                <SportSection
                  title="Cricket"
                  icon="🏏"
                  linkTo="/sport/cricket"
                  matches={cricketLive.slice(0, 4)}
                  sport="cricket"
                />
              )}

              {/* Football */}
              {footballLive.length > 0 && (
                <SportSection
                  title="Football"
                  icon="⚽"
                  linkTo="/sport/football"
                  matches={footballLive.slice(0, 4)}
                  sport="football"
                />
              )}

              {/* Nothing */}
              {cricketLive.length === 0 && footballLive.length === 0 && (
                <EmptyState isDark={isDark} message="No featured matches available. Browse upcoming fixtures on the sport pages." />
              )}
            </div>
          )}
        </section>

        {/* ════════════ FEATURES ════════════ */}
        <section className={`rounded-2xl p-8 ${isDark ? 'bg-gray-800/60' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-8 text-center">Why {APP_CONFIG.appName}?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '⚡', title: 'Real-time Scores', desc: 'Live score updates from official cricket and football data sources' },
              { icon: '📊', title: 'Match Details', desc: 'Detailed scorecards, series info and fixture schedules' },
              { icon: '🔋', title: 'API-Optimized', desc: 'Smart caching ensures data stays fresh while conserving free-tier quotas' },
            ].map((f) => (
              <div key={f.title} className="text-center">
                <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center text-2xl ${isDark ? 'bg-gray-700' : 'bg-white shadow'}`}>
                  {f.icon}
                </div>
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════ CTA ════════════ */}
        {!isAuthenticated && (
          <section className="text-center py-10">
            <h2 className="text-3xl font-bold mb-3">Ready to Get Started?</h2>
            <p className={`text-lg mb-7 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Join sports fans on {APP_CONFIG.appName}
            </p>
            <Link
              to="/auth"
              id="cta-signup-btn"
              className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
            >
              Sign Up Free
            </Link>
          </section>
        )}
      </div>
    </>
  );
};

// ─────────────── Sub-components ───────────────

const SportSection = ({ title, icon, linkTo, matches, sport }) => (
  <div>
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <span className="text-xl">{icon}</span> {title}
      </h3>
      <Link to={linkTo} className="text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors">
        View All →
      </Link>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {matches.map((m) => (
        <MatchCard key={m.id} match={m} sport={sport} />
      ))}
    </div>
  </div>
);

const LoadingSkeleton = ({ isDark, count = 3 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={`rounded-xl p-6 animate-pulse ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <div className={`h-3 w-24 rounded mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
        <div className={`h-4 w-40 rounded mb-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
        <div className={`h-4 w-36 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
      </div>
    ))}
  </div>
);

const EmptyState = ({ isDark, message }) => (
  <div className={`rounded-xl p-10 text-center ${isDark ? 'bg-gray-800/60' : 'bg-gray-50'}`}>
    <p className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
      {message}
    </p>
  </div>
);

export default Home;
