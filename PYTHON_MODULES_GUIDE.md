# Earnings Tracker - Python Extensions Guide

Complete documentation for all Python components of the Earnings Tracker project.

## 📦 Overview

Three Python modules extend the Earnings Tracker functionality:

| Module | Technology | Purpose | Status |
|--------|-----------|---------|--------|
| **Backend** | Flask + SQLAlchemy | REST API, data persistence, sync | ✅ Ready |
| **Scripts** | Pure Python | Analysis, reporting, exports | ✅ Ready |
| **Desktop App** | PyQt6 | Native GUI for analytics | ✅ Ready |

## 🚀 Quick Start

### 1. Flask Backend (Optional but Recommended)

```bash
cd python-backend
pip install -r requirements.txt
python app.py
# API runs on http://localhost:5000
```

- **Features**: Persistent database, multi-device sync, REST API
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Ports**: 5000 (API), CORS enabled for all origins
- **Time to setup**: 2-3 minutes

### 2. Python Scripts (Standalone)

```bash
cd python-scripts
pip install -r requirements.txt

# Generate reports
python report_generator.py

# Analyze earnings
python data_analyzer.py

# Export data
python export_manager.py
```

- **Features**: Analysis, daily/weekly/monthly reports, exports (CSV/Excel/PDF)
- **Input**: JSON backup files from web app
- **Output**: Text reports, spreadsheets, PDFs
- **Time to setup**: 2-3 minutes

### 3. Desktop Application (GUI)

```bash
cd python-desktop-app
pip install -r requirements.txt
python app.py
```

- **Features**: Native Windows/Mac desktop app, dashboard, reports, analytics
- **Input**: JSON backup files from web app
- **Interface**: PyQt6 (professional look and feel)
- **Time to setup**: 2-3 minutes

## 📁 Directory Structure

```
Business_expenses_earnings_tracker/
├── python-backend/
│   ├── app.py                 # Flask main app
│   ├── config.py              # Configuration
│   ├── models.py              # Database models
│   ├── routes.py              # API endpoints
│   ├── requirements.txt        # Dependencies
│   └── README.md              # Backend documentation
│
├── python-scripts/
│   ├── report_generator.py    # Daily/weekly/monthly reports
│   ├── data_analyzer.py       # Analytics and insights
│   ├── export_manager.py      # CSV/Excel/PDF exports
│   ├── requirements.txt        # Dependencies
│   └── README.md              # Scripts documentation
│
├── python-desktop-app/
│   ├── app.py                 # PyQt6 GUI application
│   ├── requirements.txt        # Dependencies
│   └── README.md              # Desktop app documentation
│
└── PYTHON_INTEGRATION_GUIDE.md # How to integrate with React
```

## 🔄 Architecture

### Data Flow

```
React Web App (localStorage)
          ↓
   Optional Backup Export
          ↓
JSON File (earnings-backup-YYYY-MM-DD.json)
          ↓
┌─────────────────────────────────────┐
│     Python Scripts / Desktop App    │
│  (Analyze, Report, Export)          │
└─────────────────────────────────────┘
          ↓
    Analysis & Exports
```

### With Flask Backend

```
React Web App
    ↓ (HTTP)
Flask Backend (5000)
    ↓ (SQL)
SQLite / PostgreSQL
    ↓
Python Scripts (API calls)
Desktop App (Direct DB or API)
```

## 📊 Module Comparison

### Flask Backend

**When to use:**
- ✅ Multiple devices needing sync
- ✅ Cloud backup of data
- ✅ Sharing data between users
- ✅ Advanced analytics dashboard

**When not needed:**
- ❌ Single-device only usage
- ❌ Offline-first priority
- ❌ Privacy/self-hosted concerns

**Deployment:**
- Local: 5 min
- Cloud (Heroku): 10 min
- Self-hosted (AWS): 30 min

### Python Scripts

**When to use:**
- ✅ Need detailed reports
- ✅ Exporting to Excel/PDF
- ✅ Analyzing trends
- ✅ Batch processing backup files

**When not needed:**
- ❌ Real-time UI needed (use desktop app)
- ❌ Just want simple backup (web app fine)

**Deployment:**
- Standalone on any computer with Python
- Can run on server as cron jobs
- Perfect for scheduled reporting

### Desktop App

**When to use:**
- ✅ Professional analytics dashboard
- ✅ Windows/Mac native GUI
- ✅ Offline analysis (no server needed)
- ✅ Professional reports and exports

**When not needed:**
- ❌ Mobile access needed (use web app)
- ❌ Simple data viewing (web app sufficient)
- ❌ Linux (PyQt6 has limited support)

**Deployment:**
- Double-click to run (Windows packaging available)
- Distribute as standalone executable (.exe/.dmg)

## 🎯 Usage Scenarios

### Scenario 1: Solo Freelancer, Single Device
```
Use: React Web App + localStorage
Skip: Python components (not needed)
Backup: Export JSON occasionally
Time: No setup needed
```

### Scenario 2: iOS User, Want Desktop Analytics
```
Use: React Web App (iPhone) + Desktop App (Python)
Setup: Install PyQt6, point to backup file
Flow: Backup → Export → Analyze on Desktop
Time: 5 min setup
```

### Scenario 3: Full Stack Multi-Device
```
Use: All components
Backend: Flask on laptop (local network sync)
Frontend: React on iPhone/Desktop
Scripts: Automated reporting
Desktop: Analytics dashboard
Time: 20-30 min setup (but very powerful)
```

### Scenario 4: Business with Employees
```
Use: Flask Backend + React + Scripts
Deployment: Cloud (Heroku/AWS)
Sharing: Multiple user accounts
Reports: Automated weekly emails
Time: 1-2 hour setup
```

## 💾 Data Persistence Strategies

### Strategy 1: localStorage Only
- ✅ Simple, instant, offline
- ❌ Data lost if browser cleared
- ✅ Good for: Single device, privacy-first

```typescript
// Default - no changes needed
```

### Strategy 2: Flask Backend Only
- ✅ Centralized, secure, sharable
- ❌ Requires server, offline not working
- ✅ Good for: Multi-device, business use

```bash
# Start backend
python python-backend/app.py

# Update React API calls (see integration guide)
```

### Strategy 3: Hybrid (Recommended)
- ✅ Best of both: offline + sync
- ✅ localStorage as fast cache
- ✅ Server as backup
- ✅ Good for: Everyone

```typescript
// Save locally (fast, instant)
localStorage.setItem('sessions', JSON.stringify(sessions))

// Sync to server (in background)
syncToServer(sessions)
```

## 🔧 Configuration

### Backend Config

Edit `python-backend/config.py`:

```python
# Database
SQLALCHEMY_DATABASE_URI = 'sqlite:///earnings_tracker.db'

# Or PostgreSQL
SQLALCHEMY_DATABASE_URI = 'postgresql://user:pass@localhost/db'

# CORS origins
CORS_ORIGINS = ['http://localhost:5174', 'https://yourdomain.com']

# Session timeout
PERMANENT_SESSION_LIFETIME = timedelta(days=30)
```

### Flask Environment

```bash
# Development (debug=True, hot reload)
FLASK_ENV=development python app.py

# Production (debug=False, optimized)
FLASK_ENV=production python app.py

# Testing
FLASK_ENV=testing python -m pytest
```

### Scripts Configuration

Edit top of each script for:
- Default backup file path
- Output directory
- Report formats
- Export options

## 📈 Performance Tips

### For Flask Backend

1. **Use PostgreSQL** for production (not SQLite)
   ```bash
   heroku addons:create heroku-postgresql:standard-0
   ```

2. **Enable query caching** for reports

3. **Add indexes** on frequently filtered columns (date, location)

4. **Use pagination** for large datasets
   ```javascript
   fetch('http://localhost:5000/api/sessions?page=1&limit=50')
   ```

### For Python Scripts

1. **Load full dataset once** (don't reload repeatedly)

2. **Use generators** for large file processing
   ```python
   def process_sessions(sessions):
       for session in sessions:
           yield analyze(session)
   ```

3. **Cache calculations** (don't recalculate same metrics)

### For Desktop App

1. **Load data on startup** (not on every tab switch)

2. **Use threading** for long operations
   ```python
   QThread().run(expensive_calculation)
   ```

3. **Implement undo/redo** efficiently

## 🔐 Security

### Backend Security

- ✅ CORS validation
- ✅ Input sanitization
- ✅ SQLAlchemy prevents SQL injection
- ⚠️ Add authentication for production:

```python
from flask_httpauth import HTTPBasicAuth
auth = HTTPBasicAuth()

@app.route('/api/sessions', methods=['GET'])
@auth.login_required
def get_sessions():
    return jsonify([s.to_dict() for s in Session.query.all()])
```

### Data Privacy

1. **Local storage**: Data never leaves device ✅
2. **Flask on local network**: Data on your WiFi only ✅
3. **Flask on cloud**: Use HTTPS, strong passwords ✅

### Backup Security

- ✓ JSON backups are plain text (consider encrypting)
- ✓ Store backups securely (not in public folder)
- ✓ Use `.gitignore` to exclude backups from git

```bash
# .gitignore
earnings-backup-*.json
*.db
.env
```

## 📚 Learning Resources

### Flask
- [Flask Official Docs](https://flask.palletsprojects.com/)
- [SQLAlchemy Guide](https://docs.sqlalchemy.org/)

### PyQt6
- [PyQt6 Docs](https://www.riverbankcomputing.com/static/Docs/PyQt6/)
- [Real Python PyQt6 Guide](https://realpython.com/python-pyqt-gui-calculator/)

### Python Data Analysis
- [Pandas Documentation](https://pandas.pydata.org/docs/)
- [Matplotlib Visualization](https://matplotlib.org/)

## 🐛 Troubleshooting

### Backend Won't Start

```bash
# Check Python version (need 3.9+)
python --version

# Check port 5000 is free
lsof -i :5000

# Start with debug output
python -c "import app; app.app.run(debug=True)"
```

### Scripts Not Finding Data

```bash
# Ensure backup file is in correct location
ls earnings-backup-*.json

# Or specify path
python -c "from report_generator import *; sessions = load_sessions_from_backup('/path/to/backup.json')"
```

### Desktop App Won't Open

```bash
# Check PyQt6 installation
python -c "from PyQt6.QtWidgets import QApplication"

# Reinstall if needed
pip install --upgrade PyQt6 PyQt6-Charts
```

### Sync Not Working

1. ✓ Backend running? `curl http://localhost:5000/health`
2. ✓ Correct API URL in React? Check `.env`
3. ✓ CORS enabled? Check Flask logs
4. ✓ Data format correct? Check browser console

## 🚀 Deployment Checklist

### Local Only (laptop/phone WiFi)
- [ ] Start Flask backend: `python app.py`
- [ ] Get laptop local IP: `ipconfig getifaddr en0`
- [ ] Update React: `VITE_API_URL=http://192.168.x.x:5000/api`
- [ ] Test on iPhone: Open app on WiFi

### Cloud Deployment
- [ ] Create account (Heroku/AWS/DigitalOcean)
- [ ] Set up database (PostgreSQL recommended)
- [ ] Deploy Flask code (`git push heroku main`)
- [ ] Update React API URL to production
- [ ] Enable HTTPS (cloud provider handles)
- [ ] Test sync from anywhere

### Desktop App Distribution
- [ ] Build executable: `pip install pyinstaller`
- [ ] Package: `pyinstaller --onefile app.py`
- [ ] Distribute `.exe` (Windows) or `.dmg` (Mac)

## 📞 Support

For each component, see:
- `python-backend/README.md` - Backend docs
- `python-scripts/README.md` - Scripts docs  
- `python-desktop-app/README.md` - Desktop app docs
- `PYTHON_INTEGRATION_GUIDE.md` - React integration

## 📋 Roadmap

### Planned Features

**Backend:**
- [ ] User authentication (multi-user)
- [ ] Email notifications
- [ ] Webhook for exports
- [ ] GraphQL API
- [ ] Scheduled reports

**Scripts:**
- [ ] Machine learning trend prediction
- [ ] Tax category detection
- [ ] Scheduled cloud backups
- [ ] Email report delivery
- [ ] Data visualization (matplotlib)

**Desktop:**
- [ ] Real-time charts and graphs
- [ ] Dark/light theme toggle
- [ ] Keyboard shortcuts
- [ ] Drag-and-drop import
- [ ] Print preview

**Integration:**
- [ ] Push notifications
- [ ] Real-time sync
- [ ] Offline mode with sync queue
- [ ] Mobile app (React Native)

## 📄 License

Part of the Earnings Tracker project.

---

**Last Updated**: 2026-02-17
**Status**: ✅ All three components ready for use
