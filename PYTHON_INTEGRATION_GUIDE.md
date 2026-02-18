# Python Backend Integration Guide

This guide explains how to integrate the Flask Python backend with the React frontend application.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (Browser)                  │
│                   (iPhone + Desktop Web)                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    HTTP/REST API (Port 5000)
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Flask Backend (Python Server)                   │
│     (Database: SQLite/PostgreSQL, Port 5000)                │
└─────────────────────────────────────────────────────────────┘
                              ↓
                        Database
```

## Quick Start

### Option 1: Frontend Only (Default)

The React app stores everything in **localStorage** (browser storage). Perfect for:
- Single device use
- Privacy/offline first
- No server setup

### Option 2: With Flask Backend

Adds:
- ✅ Data persistence on server
- ✅ Multi-device sync
- ✅ Backup/restore
- ✅ Analytics dashboard
- ✅ Advanced reporting

### Option 3: Full Stack (Backend + Desktop + Scripts)

Complete suite:
- ✅ Flask backend + database
- ✅ React web/mobile frontend
- ✅ PyQt6 desktop app
- ✅ Python analysis scripts
- ✅ Automated reporting

## Setup Instructions

### 1. Start Flask Backend

```bash
cd python-backend
pip install -r requirements.txt
python app.py
```

Server runs on: `http://localhost:5000`

API available at: `http://localhost:5000/api`

### 2. Update React Frontend

Create a `.env` file in the React root:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Update React API Calls

Create a new file `src/api/client.ts`:

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export async function getSessionsFromServer() {
  const response = await fetch(`${API_URL}/sessions`)
  return response.json()
}

export async function createSessionOnServer(session: SessionData) {
  const response = await fetch(`${API_URL}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(session),
  })
  return response.json()
}

export async function syncToServer(sessions: SessionData[]) {
  const response = await fetch(`${API_URL}/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      deviceId: getDeviceId(),
      sessions: sessions,
    }),
  })
  return response.json()
}
```

### 4. Update App Component

Modify `src/App.tsx`:

```typescript
import { getSessionsFromServer, createSessionOnServer, syncToServer } from './api/client'

function App() {
  // ... existing state ...
  
  // Load from server instead of localStorage
  useEffect(() => {
    if (useServerBackend) {
      getSessionsFromServer()
        .then(setSessions)
        .catch(console.error)
    }
  }, [])
  
  // Save to server
  const addSession = (session: SessionData) => {
    const newSession = { ...session, id: Date.now().toString() }
    setSessions([...sessions, newSession])
    
    if (useServerBackend) {
      createSessionOnServer(newSession).catch(console.error)
    }
  }
  
  // Sync all sessions
  const syncSessions = async () => {
    if (useServerBackend) {
      const result = await syncToServer(sessions)
      setSessions(result.sessions)
    }
  }
}
```

## API Endpoints Reference

### Sessions

#### GET /api/sessions
Get all sessions with optional filters

```javascript
// Get all sessions
fetch('http://localhost:5000/api/sessions')

// Get sessions for a date range
fetch('http://localhost:5000/api/sessions?startDate=2026-02-01&endDate=2026-02-28')

// Get sessions by location
fetch('http://localhost:5000/api/sessions?location=halo')
```

Response:
```json
[
  {
    "id": "1708080000",
    "location": "halo",
    "date": "2026-02-17",
    "services": [
      {
        "id": "1",
        "type": "massage",
        "duration": 60,
        "rate": 50,
        "haloBasePrice": 50
      }
    ],
    "addOns": [],
    "tips": 10,
    "hasClientReview": false
  }
]
```

#### POST /api/sessions
Create a new session

```javascript
fetch('http://localhost:5000/api/sessions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: '1708080000',
    location: 'halo',
    date: '2026-02-17',
    services: [
      {
        id: '1',
        type: 'massage',
        duration: 60,
        rate: 50,
        haloBasePrice: 50
      }
    ],
    addOns: [],
    tips: 10,
    hasClientReview: false
  })
})
```

#### PUT /api/sessions/<id>
Update a session

```javascript
fetch('http://localhost:5000/api/sessions/1708080000', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tips: 15,
    hasClientReview: true
  })
})
```

#### DELETE /api/sessions/<id>
Delete a session

```javascript
fetch('http://localhost:5000/api/sessions/1708080000', {
  method: 'DELETE'
})
```

### Sync

#### POST /api/sync
Sync sessions from device

```javascript
fetch('http://localhost:5000/api/sync', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    deviceId: 'iphone-12345',
    sessions: [/* array of sessions */]
  })
})
```

Response:
```json
{
  "status": "success",
  "synced": 5,
  "sessions": [/* all sessions from server */]
}
```

### Closed Dates

#### GET /api/closed-dates
Get all closed dates

```javascript
fetch('http://localhost:5000/api/closed-dates')
```

Response:
```json
{
  "2026-02-17": true,
  "2026-02-16": true
}
```

#### POST /api/closed-dates/<date>
Close a date

```javascript
fetch('http://localhost:5000/api/closed-dates/2026-02-17', {
  method: 'POST'
})
```

#### DELETE /api/closed-dates/<date>
Reopen a date

```javascript
fetch('http://localhost:5000/api/closed-dates/2026-02-17', {
  method: 'DELETE'
})
```

### Stats

#### GET /api/stats
Get earnings statistics

```javascript
fetch('http://localhost:5000/api/stats?location=halo&startDate=2026-02-01&endDate=2026-02-28')
```

Response:
```json
{
  "totalSessions": 15,
  "totalEarnings": 500.50,
  "sessionsByLocation": {
    "halo": 15
  },
  "sessionsByDate": {
    "2026-02-17": 3,
    "2026-02-16": 2
  }
}
```

## Database Schema

### sessions
```sql
CREATE TABLE sessions (
  id VARCHAR(50) PRIMARY KEY,
  location VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  services_json TEXT,
  addons_json TEXT,
  tips FLOAT,
  review TEXT,
  rating INTEGER,
  has_client_review BOOLEAN,
  created_at DATETIME,
  updated_at DATETIME
)
```

### closed_dates
```sql
CREATE TABLE closed_dates (
  id INTEGER PRIMARY KEY,
  date DATE UNIQUE,
  closed_at DATETIME,
  is_closed BOOLEAN
)
```

### sync_logs
```sql
CREATE TABLE sync_logs (
  id INTEGER PRIMARY KEY,
  device_id VARCHAR(100),
  action VARCHAR(50),
  session_count INTEGER,
  timestamp DATETIME
)
```

## Deployment

### Local Network Sync

Run backend on your laptop, access from iPhone on same WiFi:

```bash
# Start backend (listen on all interfaces)
cd python-backend
python app.py

# Get your laptop IP
ipconfig getifaddr en0  # macOS
hostname -I              # Linux

# In React app environment:
# VITE_API_URL=http://192.168.0.100:5000/api
```

### Docker Deployment

```dockerfile
# python-backend/Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "app.py"]
```

```bash
docker build -t earnings-backend .
docker run -p 5000:5000 earnings-backend
```

### Heroku Deployment

```bash
# Create Heroku app
heroku create your-app-name

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Deploy
git push heroku main

# Backend available at: https://your-app-name.herokuapp.com/api
```

### AWS/DigitalOcean Deployment

Use gunicorn server:

```bash
pip install gunicorn
gunicorn --bind 0.0.0.0:5000 "app:create_app()"
```

## Hybrid Mode: localStorage + Server

Keep localStorage as fallback, sync to server:

```typescript
// Save locally first (fast)
localStorage.setItem('earnings-sessions', JSON.stringify(sessions))

// Then sync to server (in background)
syncToServer(sessions).catch(err => {
  console.log('Server sync failed, using local cache')
})
```

Benefits:
- ✅ Instant save (offline support)
- ✅ Server backup (redundancy)
- ✅ Works without internet
- ✅ Syncs when connection returns

## Troubleshooting

### CORS Errors

If you see "Cross-Origin Request Blocked":

1. Check Flask backend is running: `http://localhost:5000/health`
2. Update CORS in `python-backend/config.py`:

```python
CORS(app, resources={
    r"/api/*": {
        "origins": ["*"],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type"]
    }
})
```

### Connection Refused

- Backend not running? Start it: `python app.py`
- Wrong port? Check `python-backend/app.py` (default 5000)
- Wrong IP? Run `ipconfig getifaddr en0` to find IP

### Database Locked

SQLite has limited concurrent access:
- Use PostgreSQL for production
- Or close other connections to database

### Session Data Not Syncing

1. Check API response: `curl http://localhost:5000/api/sessions`
2. Verify data format matches API schema
3. Check browser console for errors
4. Check Flask backend logs

## Switching Storage Strategy

### Option A: localStorage Only
```typescript
// Default - no changes needed
```

### Option B: Server Only
```typescript
// Disable localStorage
useEffect(() => {
  getSessionsFromServer().then(setSessions)
}, [])

const saveSession = async (session) => {
  await createSessionOnServer(session)
}
```

### Option C: Hybrid (Recommended)
```typescript
// Load from server with localStorage fallback
useEffect(() => {
  getSessionsFromServer()
    .then(setSessions)
    .catch(() => {
      // Fallback to localStorage
      const local = localStorage.getItem('earnings-sessions')
      setSessions(local ? JSON.parse(local) : [])
    })
}, [])
```

## Performance Considerations

### Pagination (Recommended)

For large datasets (1000+ sessions):

```javascript
// API with pagination
fetch(`${API_URL}/sessions?page=1&limit=50`)
```

### Caching

Cache API responses in React:

```typescript
const [cache, setCache] = useState({})

const getCachedSessions = async () => {
  const cacheKey = 'sessions-list'
  const cached = cache[cacheKey]
  
  if (cached && Date.now() - cached.time < 60000) {
    return cached.data
  }
  
  const data = await getSessionsFromServer()
  setCache({
    ...cache,
    [cacheKey]: { data, time: Date.now() }
  })
  return data
}
```

### Batch Operations

Sync multiple sessions at once:

```javascript
fetch(`${API_URL}/sync`, {
  method: 'POST',
  body: JSON.stringify({
    deviceId: 'iphone-12345',
    sessions: allSessions // All at once
  })
})
```

## Next Steps

1. **Start Backend**: `cd python-backend && python app.py`
2. **Test API**: Visit `http://localhost:5000/health`
3. **Update React**: Add API calls to frontend
4. **Deploy**: Choose hosting platform
5. **Monitor**: Check logs and sync status

## Support

For API issues:
- Check Flask console output
- Review Chrome DevTools Network tab
- Test endpoints with curl

For integration help:
- See example React code above
- Check `python-backend/README.md`
- Review Flask routes in `routes.py`
