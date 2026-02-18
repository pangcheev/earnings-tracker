# Python Flask Backend for Earnings Tracker

A RESTful API backend for the Earnings Tracker app, handling session data synchronization, storage, and analytics.

## Setup

### 1. Install Dependencies

```bash
cd python-backend
pip install -r requirements.txt
```

### 2. Environment Variables

Create a `.env` file:

```
FLASK_ENV=development
FLASK_APP=app.py
DATABASE_URL=sqlite:///earnings_tracker.db
```

For production with PostgreSQL:
```
DATABASE_URL=postgresql://user:password@localhost/earnings_tracker
```

### 3. Run the Server

```bash
python app.py
```

Server runs on `http://localhost:5000`

## API Endpoints

### Sessions

- `GET /api/sessions` - Get all sessions
  - Query params: `startDate`, `endDate`, `location`
- `GET /api/sessions/<YYYY-MM-DD>` - Get sessions for a specific date
- `POST /api/sessions` - Create a new session
- `PUT /api/sessions/<id>` - Update a session
- `DELETE /api/sessions/<id>` - Delete a session

### Closed Dates

- `GET /api/closed-dates` - Get all closed dates
- `POST /api/closed-dates/<YYYY-MM-DD>` - Close a date
- `DELETE /api/closed-dates/<YYYY-MM-DD>` - Reopen a date

### Sync

- `POST /api/sync` - Sync sessions from device
- `GET /api/sync-status` - Get sync statistics

### Stats

- `GET /api/stats` - Get earnings statistics
  - Query params: `startDate`, `endDate`, `location`

## Database

Uses SQLAlchemy ORM with SQLite by default (easily switch to PostgreSQL).

Models:
- `Session` - Individual therapy sessions
- `ClosedDate` - Closed date tracking
- `SyncLog` - Device sync history

## CORS

Enabled for all origins in development. Configure in `config.py` for production.

## Integration with React Frontend

Update React API calls to use Flask backend:

```javascript
// Example: GET sessions
const response = await fetch('http://localhost:5000/api/sessions?location=halo')
const sessions = await response.json()
```

## Deployment

### Docker

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:create_app()"]
```

### Heroku

```bash
heroku create your-app-name
heroku config:set DATABASE_URL=postgresql://...
git push heroku main
```
