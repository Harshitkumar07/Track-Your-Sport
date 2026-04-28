import { lazy } from 'react';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('../pages/Home'));
const ExplorePage = lazy(() => import('../pages/Explore'));
const MatchListPage = lazy(() => import('../pages/MatchList'));
const MatchDetailPage = lazy(() => import('../pages/MatchDetail'));
const SeriesPage = lazy(() => import('../pages/Series'));
const CommunityPage = lazy(() => import('../pages/Community'));
const PostDetailPage = lazy(() => import('../pages/PostDetail'));
const ProfilePage = lazy(() => import('../pages/Profile'));
const AdminPage = lazy(() => import('../pages/Admin'));
const AuthPage = lazy(() => import('../pages/Auth'));
const NotFoundPage = lazy(() => import('../pages/NotFound'));
const PrivacyPage = lazy(() => import('../pages/Privacy'));
const TermsPage = lazy(() => import('../pages/Terms'));
const CookiesPage = lazy(() => import('../pages/Cookies'));

// Route configuration
export const routes = [
  {
    path: '/',
    element: HomePage,
    title: 'Home',
    isPublic: true,
    showInNav: true,
    icon: 'home'
  },
  {
    path: '/explore',
    element: ExplorePage,
    title: 'Explore',
    isPublic: true,
    showInNav: true,
    icon: 'explore'
  },
  {
    path: '/sport/:sport',
    element: MatchListPage,
    title: 'Matches',
    isPublic: true,
    showInNav: false
  },
  {
    path: '/sport/:sport/match/:matchId',
    element: MatchDetailPage,
    title: 'Match Detail',
    isPublic: true,
    showInNav: false
  },
  {
    path: '/sport/:sport/series',
    element: SeriesPage,
    title: 'Series',
    isPublic: true,
    showInNav: false
  },
  {
    path: '/community/:sport',
    element: CommunityPage,
    title: 'Community',
    isPublic: true,
    showInNav: false
  },
  {
    path: '/community/:sport/post/:postId',
    element: PostDetailPage,
    title: 'Post',
    isPublic: true,
    showInNav: false
  },
  {
    path: '/profile',
    element: ProfilePage,
    title: 'Profile',
    isPublic: false,
    requireAuth: true,
    showInNav: true,
    icon: 'person'
  },
  {
    path: '/admin',
    element: AdminPage,
    title: 'Admin',
    isPublic: false,
    requireAuth: true,
    requireRole: 'admin',
    showInNav: false,
    icon: 'admin'
  },
  {
    path: '/auth',
    element: AuthPage,
    title: 'Sign In',
    isPublic: true,
    showInNav: false
  },
  {
    path: '/privacy',
    element: PrivacyPage,
    title: 'Privacy Policy',
    isPublic: true,
    showInNav: false
  },
  {
    path: '/terms',
    element: TermsPage,
    title: 'Terms of Service',
    isPublic: true,
    showInNav: false
  },
  {
    path: '/cookies',
    element: CookiesPage,
    title: 'Cookie Policy',
    isPublic: true,
    showInNav: false
  },
  {
    path: '*',
    element: NotFoundPage,
    title: '404 Not Found',
    isPublic: true,
    showInNav: false
  }
];

// ─────────────────────────────────────────────────────────────
// SUPPORTED SPORTS
//
// Cricket       → CricData.org free API  (100 req/day)
// All others    → API-Sports free APIs   (100 req/day EACH, separate quotas)
//
// "featured" sports appear on the home page dashboard.
// All sports appear on the Explore page and in the nav dropdown.
// ─────────────────────────────────────────────────────────────
export const SUPPORTED_SPORTS = [
  // ── Featured on dashboard ──
  {
    id: 'cricket',
    name: 'Cricket',
    icon: '🏏',
    color: 'green',
    gradient: 'from-emerald-500 to-green-600',
    enabled: true,
    featured: true,
    description: 'Live scores, series info & match details',
    provider: 'CricData.org',
    apiType: 'cricdata',
  },
  {
    id: 'football',
    name: 'Football',
    icon: '⚽',
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-600',
    enabled: true,
    featured: true,
    description: 'Live fixtures, league standings & match stats',
    provider: 'API-Sports',
    apiType: 'apisports',
  },
  {
    id: 'basketball',
    name: 'Basketball',
    icon: '🏀',
    color: 'orange',
    gradient: 'from-orange-500 to-amber-600',
    enabled: true,
    featured: true,
    description: 'NBA, international leagues & live game scores',
    provider: 'API-Sports',
    apiType: 'apisports',
  },

  // ── Other API-Sports ──
  {
    id: 'baseball',
    name: 'Baseball',
    icon: '⚾',
    color: 'red',
    gradient: 'from-red-500 to-rose-600',
    enabled: true,
    featured: false,
    description: 'MLB, international baseball leagues & scores',
    provider: 'API-Sports',
    apiType: 'apisports',
  },
  {
    id: 'hockey',
    name: 'Hockey',
    icon: '🏒',
    color: 'teal',
    gradient: 'from-teal-500 to-cyan-600',
    enabled: true,
    featured: false,
    description: 'NHL, ice hockey leagues & live scores',
    provider: 'API-Sports',
    apiType: 'apisports',
  },
  {
    id: 'rugby',
    name: 'Rugby',
    icon: '🏉',
    color: 'amber',
    gradient: 'from-amber-600 to-yellow-600',
    enabled: true,
    featured: false,
    description: 'Rugby union & league matches worldwide',
    provider: 'API-Sports',
    apiType: 'apisports',
  },
  {
    id: 'volleyball',
    name: 'Volleyball',
    icon: '🏐',
    color: 'indigo',
    gradient: 'from-indigo-500 to-violet-600',
    enabled: true,
    featured: false,
    description: 'International volleyball leagues & scores',
    provider: 'API-Sports',
    apiType: 'apisports',
  },
  {
    id: 'handball',
    name: 'Handball',
    icon: '🤾',
    color: 'purple',
    gradient: 'from-purple-500 to-fuchsia-600',
    enabled: true,
    featured: false,
    description: 'European & international handball matches',
    provider: 'API-Sports',
    apiType: 'apisports',
  },
  {
    id: 'american-football',
    name: 'NFL',
    icon: '🏈',
    color: 'emerald',
    gradient: 'from-emerald-600 to-green-700',
    enabled: true,
    featured: false,
    description: 'NFL, American football games & scores',
    provider: 'API-Sports',
    apiType: 'apisports',
  },
  {
    id: 'afl',
    name: 'AFL',
    icon: '🏉',
    color: 'sky',
    gradient: 'from-sky-500 to-blue-600',
    enabled: true,
    featured: false,
    description: 'Australian Football League matches & scores',
    provider: 'API-Sports',
    apiType: 'apisports',
  },
  {
    id: 'formula-1',
    name: 'Formula 1',
    icon: '🏎️',
    color: 'red',
    gradient: 'from-red-600 to-orange-600',
    enabled: true,
    featured: false,
    description: 'F1 races, standings & driver stats',
    provider: 'API-Sports',
    apiType: 'apisports',
  },
  {
    id: 'mma',
    name: 'MMA',
    icon: '🥊',
    color: 'rose',
    gradient: 'from-rose-600 to-red-700',
    enabled: true,
    featured: false,
    description: 'UFC, MMA fight events & results',
    provider: 'API-Sports',
    apiType: 'apisports',
  },
  {
    id: 'nba',
    name: 'NBA',
    icon: '🏀',
    color: 'orange',
    gradient: 'from-orange-600 to-red-600',
    enabled: true,
    featured: false,
    description: 'NBA games, scores & player stats',
    provider: 'API-Sports',
    apiType: 'apisports',
  },
];

// Helper: get only featured sports (shown on home/dashboard)
export const FEATURED_SPORTS = SUPPORTED_SPORTS.filter(s => s.featured);

// Alias for backward compatibility
export const SPORTS = SUPPORTED_SPORTS;

// Match status configurations
export const MATCH_STATUS = {
  LIVE: 'live',
  UPCOMING: 'upcoming',
  COMPLETED: 'completed'
};

// User roles
export const USER_ROLES = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin'
};

// API endpoints (for cloud functions)
export const API_ENDPOINTS = {
  MATCHES: '/matches',
  SERIES: '/series',
  POSTS: '/posts',
  COMMENTS: '/comments',
  USERS: '/users',
  ADMIN: '/admin'
};

// App configuration
export const APP_CONFIG = {
  appName: 'Track Your Sport',
  appTagline: 'Real-time Cricket, Football & Many More Sports Scores',
  appDescription: 'Track live scores for cricket, football, basketball, hockey, rugby and many more sports with community discussions',
  defaultSport: 'cricket',
  postsPerPage: 20,
  commentsPerPage: 50,
  matchesPerPage: 20,
  maxPostLength: 20000,
  maxCommentLength: 10000,
  maxTitleLength: 200,
  minTitleLength: 3,
  voteCooldown: 1000,
  searchDebounce: 300,
  realtimePollingInterval: 600000, // 10 minutes
  cacheTimeout: 300000,
  offlineMessageDelay: 3000,
  maxFileSize: 5242880,
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxReportLength: 500,
  moderatorBadgeColor: 'purple',
  adminBadgeColor: 'red'
};

// Feature flags
export const FEATURES = {
  ENABLE_PWA: process.env.REACT_APP_ENABLE_PWA === 'true',
  ENABLE_PUSH_NOTIFICATIONS: process.env.REACT_APP_ENABLE_PUSH_NOTIFICATIONS === 'true',
  ENABLE_ANALYTICS: process.env.REACT_APP_ANALYTICS_ENABLED === 'true',
  ENABLE_DISCORD: false,
  ENABLE_DARK_MODE: true,
  ENABLE_OFFLINE_MODE: true,
  ENABLE_SOCIAL_SHARING: true,
  ENABLE_EMAIL_NOTIFICATIONS: false,
  ENABLE_ADVANCED_SEARCH: false,
  ENABLE_LIVE_CHAT: false
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  AUTH_REQUIRED: 'Please sign in to continue.',
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
  INVALID_INPUT: 'Please check your input and try again.',
  RATE_LIMIT: 'Too many requests. Please try again later.',
  SERVER_ERROR: 'Something went wrong. Please try again.',
  NOT_FOUND: 'The requested resource was not found.',
  OFFLINE: 'You are currently offline. Some features may be limited.'
};

// Success messages
export const SUCCESS_MESSAGES = {
  POST_CREATED: 'Post created successfully!',
  POST_UPDATED: 'Post updated successfully!',
  POST_DELETED: 'Post deleted successfully!',
  COMMENT_ADDED: 'Comment added successfully!',
  COMMENT_DELETED: 'Comment deleted successfully!',
  VOTE_RECORDED: 'Your vote has been recorded!',
  REPORT_SUBMITTED: 'Report submitted. Thank you for helping keep our community safe.',
  PROFILE_UPDATED: 'Profile updated successfully!',
  SETTINGS_SAVED: 'Settings saved successfully!'
};

export default routes;
