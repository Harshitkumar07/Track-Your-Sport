# Track Your Sport

A real-time multi-sport score tracking platform built with React, Firebase, and third-party sports APIs. Track live scores, upcoming fixtures, and match details across 13 sports including Cricket, Football, Basketball, Hockey, and more.

**Live:** [track-your-sport-c09b4.web.app](https://track-your-sport-c09b4.web.app/)

---

## Features

### Live Score Tracking
- Real-time scores for Cricket (via CricData.org) and Football, Basketball, Hockey, Rugby, Baseball, Volleyball, Handball, NFL, AFL, Formula 1, MMA, NBA (via API-Sports)
- Unified match cards with team logos, scores, status badges, and relative date formatting
- Dashboard with live match counts and quick navigation

### Multi-Sport Support
- 13 sports with dedicated data providers
- Each sport has independent API quota (100 requests/day per sport on API-Sports)
- Smart client-side caching (5 min for live, 20 min for upcoming, 30 min for recent)
- Request deduplication to prevent redundant API calls

### Match Details
- Detailed match view with team information, venue, date/time, and scores
- Cricket scorecard with runs, wickets, overs, and run rate
- Zero extra API calls when navigating from match list (uses React Router state)
- Fallback to cached data for direct URL access

### Community and User Features
- User authentication via Google OAuth and email/password (Firebase Auth)
- Community forums with posts, comments, and voting
- User profiles and preferences
- Role-based access control (User, Moderator, Admin)
- Dark/Light theme switching

### Admin Panel
- Content moderation dashboard
- User management
- System settings and reports queue

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Tailwind CSS |
| State | React Context, React Query |
| Auth | Firebase Authentication |
| Database | Firebase Realtime Database |
| Hosting | Firebase Hosting (frontend), Vercel Serverless Functions (API proxy) |
| Cricket API | CricData.org |
| Sports APIs | API-Sports (12 sports) |
| Build | Create React App, CI=false for production builds |

---

## Architecture

```
Client (React SPA)
    |
    v
Vercel Serverless Functions (API Proxy)
    |
    +---> /api/cricket-live       --> CricData.org
    +---> /api/cricket-upcoming   --> CricData.org
    +---> /api/cricket-recent     --> CricData.org
    +---> /api/cricket-series     --> CricData.org
    +---> /api/football-live      --> API-Football
    +---> /api/football-upcoming  --> API-Football
    +---> /api/sports-proxy       --> API-Sports (all other sports)
    +---> /api/health             --> Health check
```

The Vercel proxy layer handles API key injection, CORS, and response normalization. The React client caches responses aggressively to minimize API usage.

---

## Prerequisites

- Node.js 18+ LTS
- npm 9+
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project with Authentication and Realtime Database enabled
- API keys for CricData.org and API-Sports

---

## Installation

1. **Clone the repository**
```bash
git clone https://github.com/Harshitkumar07/Track-Your-Sport.git
cd Track-Your-Sport
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Firebase config and Vercel API URL:
```env
REACT_APP_FIREBASE_API_KEY=your_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
REACT_APP_FIREBASE_PROJECT_ID=your_project
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_VERCEL_API_URL=https://your-vercel-app.vercel.app/api
```

4. **Start development server**
```bash
npm start
```

The app will be available at http://localhost:3000.

---

## Deployment

### Firebase Hosting (Frontend)

```bash
# Build the production bundle
set CI=false && npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

### Vercel (API Proxy)

The `/api` directory contains Vercel serverless functions. Deploy with:

```bash
npx vercel --prod --yes
```

Ensure the following environment variables are set in your Vercel project:
- `CRICAPI_KEY` - CricData.org API key
- `APISPORTS_KEY` - API-Sports API key

---

## Project Structure

```
Track-Your-Sport/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── MatchCard.jsx    # Unified match card for all sports
│   │   ├── SportsDashboard  # Multi-sport dashboard with tabs
│   │   ├── Navbar.jsx       # Navigation with sports dropdown
│   │   ├── Footer.jsx       # Site footer with legal links
│   │   └── ...
│   ├── pages/               # Route-level page components
│   │   ├── Home.jsx         # Landing page with hero + live matches
│   │   ├── Explore.jsx      # Browse all sports
│   │   ├── MatchList.jsx    # Sport-specific match listing
│   │   ├── MatchDetail.jsx  # Individual match details
│   │   ├── Privacy.jsx      # Privacy policy
│   │   ├── Terms.jsx        # Terms of service
│   │   ├── Cookies.jsx      # Cookie policy
│   │   └── ...
│   ├── services/
│   │   ├── apiService.js    # Unified API client with caching
│   │   └── firebase/        # Firebase client setup
│   ├── config/
│   │   └── routes.js        # Route definitions + sport config
│   ├── contexts/            # Auth + Theme contexts
│   └── hooks/               # Custom React hooks
├── api/                     # Vercel serverless functions
│   ├── cricket-live.js      # CricData live matches
│   ├── football-live.js     # API-Football live fixtures
│   ├── sports-proxy.js      # Generic proxy for all API-Sports
│   └── health.js            # Health check endpoint
├── functions/               # Firebase Cloud Functions
├── public/                  # Static assets
└── firebase.json            # Firebase hosting + functions config
```

---

## API Usage and Optimization

### Free Tier Limits
- **CricData.org:** 100 requests/day (shared across all cricket endpoints)
- **API-Sports:** 100 requests/day per sport (12 separate quotas)

### Optimization Strategies
- Client-side caching with configurable TTLs (5 min live, 20 min upcoming, 30 min recent)
- Request deduplication prevents duplicate in-flight requests
- Dashboard only fetches 3 featured sports on page load
- Other sports lazy-load when user navigates to them
- Match detail page uses zero extra API calls (data passed via router state)
- Stale cache fallback on API errors

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `REACT_APP_FIREBASE_API_KEY` | Firebase API key |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `REACT_APP_FIREBASE_DATABASE_URL` | Firebase RTDB URL |
| `REACT_APP_FIREBASE_PROJECT_ID` | Firebase project ID |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `REACT_APP_FIREBASE_APP_ID` | Firebase app ID |
| `REACT_APP_VERCEL_API_URL` | Vercel API proxy base URL |
| `REACT_APP_ENV` | Environment (development/production) |

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## Acknowledgments

- [Firebase](https://firebase.google.com/) for authentication, database, and hosting
- [CricData.org](https://cricketdata.org/) for cricket match data
- [API-Sports](https://api-sports.io/) for multi-sport data
- [React](https://react.dev/) and [Tailwind CSS](https://tailwindcss.com/) communities

---

Built by the Track Your Sport Team
