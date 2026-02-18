# Earnings Tracker - Analysis & Reporting Scripts

Python scripts for analyzing, reporting, and exporting earnings data from the Earnings Tracker app.

## Installation

```bash
pip install -r requirements.txt
```

## Scripts

### 1. Report Generator (`report_generator.py`)

Generate daily, weekly, and monthly earnings reports.

**Usage:**

```python
from report_generator import EarningsReport, load_sessions_from_backup

# Load sessions from backup
sessions = load_sessions_from_backup('earnings-backup-2026-02-17.json')

# Create report generator
reporter = EarningsReport(sessions, location='halo')  # or 'soul-bridge', 'all'

# Generate daily report
daily_report = reporter.generate_daily_report('2026-02-17')
print(daily_report)

# Generate weekly report
weekly_report = reporter.generate_weekly_report('2026-02-17')

# Generate monthly report
monthly_report = reporter.generate_monthly_report('2026-02')
```

**Features:**
- Daily earnings breakdown
- Weekly summaries
- Monthly reports with averages and statistics
- Filter by location (Halo Therapies, Soul Bridge Healing, or all)
- Save reports to text files

### 2. Data Analyzer (`data_analyzer.py`)

Analyze earnings trends and generate insights.

**Usage:**

```python
from data_analyzer import EarningsAnalyzer, load_sessions_from_backup

sessions = load_sessions_from_backup('earnings-backup-2026-02-17.json')
analyzer = EarningsAnalyzer(sessions)

# Get statistics
stats = analyzer.get_session_statistics()
print(f"Average earnings per session: ${stats['averageSessionEarnings']:.2f}")

# Get service breakdown
services = analyzer.get_service_breakdown()
print(services)  # {'massage': 5, 'deep-tissue': 3, ...}

# Get tip statistics
tips = analyzer.get_tip_statistics()
print(f"Total tips: ${tips['totalTips']:.2f}")
print(f"Tip percentage: {tips['tipPercentage']:.1f}%")

# Get best earning days
best_days = analyzer.get_best_days(5)
for date, earnings in best_days:
    print(f"{date}: ${earnings:.2f}")

# Generate comprehensive summary
summary = analyzer.generate_summary_report()
print(summary)
```

**Available Methods:**
- `get_total_earnings()` - Total earnings across all sessions
- `get_earnings_by_location()` - Breakdown by business location
- `get_daily_averages()` - Average earnings per day
- `get_session_statistics()` - Mean, median, min, max, stddev
- `get_service_breakdown()` - Count by service type
- `get_addon_revenue()` - Revenue from add-ons
- `get_tip_statistics()` - Comprehensive tip analysis
- `get_daily_metrics()` - Detailed daily metrics
- `get_best_days(limit)` - Top earning days
- `get_productivity_score()` - Working days and sessions/day
- `generate_summary_report()` - Full analysis report

### 3. Export Manager (`export_manager.py`)

Export data to multiple formats: CSV, Excel, PDF.

**Usage:**

```python
from export_manager import ExportManager, load_sessions_from_backup

sessions = load_sessions_from_backup('earnings-backup-2026-02-17.json')
exporter = ExportManager(sessions)

# Export to CSV
exporter.export_to_csv('earnings.csv')

# Export to Excel
exporter.export_to_excel('earnings.xlsx')

# Export to PDF
exporter.export_to_pdf('earnings.pdf')
```

**Formats:**
- **CSV**: Spreadsheet-compatible format
- **Excel**: Professional formatting with colors and borders
- **PDF**: Print-ready reports with summary tables

## Command-Line Usage

Each script can be run directly:

```bash
# Generate reports
python report_generator.py

# Analyze data
python data_analyzer.py

# Export to multiple formats
python export_manager.py
```

## Integration with Flask Backend

All scripts work standalone with JSON backups but can also integrate with the Flask backend:

```python
import requests

# Get sessions from API
response = requests.get('http://localhost:5000/api/sessions')
sessions = response.json()

# Analyze
from data_analyzer import EarningsAnalyzer
analyzer = EarningsAnalyzer(sessions)
print(analyzer.generate_summary_report())
```

## Example Workflow

```bash
# 1. Export backup from web app
# Download earnings-backup-2026-02-17.json from web interface

# 2. Generate reports
python -c "from report_generator import *; sessions = load_sessions_from_backup('earnings-backup-2026-02-17.json'); print(EarningsReport(sessions).generate_monthly_report())"

# 3. Export to Excel for sharing
python -c "from export_manager import *; sessions = load_sessions_from_backup('earnings-backup-2026-02-17.json'); ExportManager(sessions).export_to_excel()"

# 4. Generate analysis
python data_analyzer.py
```

## Tips

- Run directly from command line for one-off analysis
- Import classes in your own scripts for programmatic access
- Combine multiple scripts for comprehensive reporting
- Results can be printed, emailed, or saved to files

## Future Enhancements

- Database integration (read directly from Flask backend)
- Scheduled report generation (cron jobs)
- Email delivery of reports
- Advanced visualizations (matplotlib, seaborn)
- Tax category tracking
- Payroll integration
