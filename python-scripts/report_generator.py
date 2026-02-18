"""
Report Generator for Earnings Tracker
Generates daily, weekly, and monthly earnings reports
"""

import json
import csv
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Tuple

class EarningsReport:
    def __init__(self, sessions_data: List[Dict], location: str = 'all'):
        """
        Initialize report generator
        
        Args:
            sessions_data: List of session dictionaries
            location: 'soul-bridge', 'halo', or 'all'
        """
        self.sessions = sessions_data
        self.location = location
        
        # Filter by location if specified
        if location != 'all':
            self.sessions = [s for s in sessions_data if s.get('location') == location]
        
        self.filtered_sessions = self.sessions
    
    def filter_by_date_range(self, start_date: str, end_date: str) -> 'EarningsReport':
        """Filter sessions by date range (YYYY-MM-DD format)"""
        self.filtered_sessions = [
            s for s in self.sessions
            if start_date <= s.get('date', '') <= end_date
        ]
        return self
    
    def filter_by_date(self, date: str) -> 'EarningsReport':
        """Filter sessions by specific date (YYYY-MM-DD format)"""
        self.filtered_sessions = [s for s in self.sessions if s.get('date') == date]
        return self
    
    def calculate_daily_totals(self) -> Dict[str, Dict]:
        """Calculate totals for each day"""
        daily_data = {}
        
        for session in self.filtered_sessions:
            date = session.get('date', 'unknown')
            
            if date not in daily_data:
                daily_data[date] = {
                    'sessions': 0,
                    'earnings': 0.0,
                    'tips': 0.0,
                    'services': [],
                }
            
            daily_data[date]['sessions'] += 1
            daily_data[date]['tips'] += session.get('tips', 0)
            
            # Calculate earnings based on services
            for service in session.get('services', []):
                daily_data[date]['services'].append(service)
                if 'rate' in service and 'duration' in service:
                    earnings = (service['rate'] / 60) * service['duration']
                    daily_data[date]['earnings'] += earnings
            
            daily_data[date]['earnings'] += session.get('tips', 0)
        
        return daily_data
    
    def generate_daily_report(self, date: str) -> str:
        """Generate a daily report for a specific date"""
        self.filter_by_date(date)
        
        report = f"EARNINGS REPORT - {date}\n"
        report += "=" * 50 + "\n\n"
        
        if not self.filtered_sessions:
            report += "No sessions recorded for this date.\n"
            return report
        
        report += f"Total Sessions: {len(self.filtered_sessions)}\n\n"
        
        total_earnings = 0
        total_tips = 0
        services_count = {}
        
        for session in self.filtered_sessions:
            report += f"\nSession {session.get('id', 'unknown')}\n"
            report += "-" * 30 + "\n"
            
            # Services
            for service in session.get('services', []):
                service_type = service.get('type', 'unknown')
                duration = service.get('duration', 0)
                rate = service.get('rate', 0)
                
                earnings = (rate / 60) * duration if rate and duration else 0
                total_earnings += earnings
                
                services_count[service_type] = services_count.get(service_type, 0) + 1
                
                report += f"  {service_type}: {duration}min @ ${rate}/hr = ${earnings:.2f}\n"
            
            # Add-ons
            for addon in session.get('addOns', []):
                price = addon.get('price', 0)
                total_earnings += price
                report += f"  Add-on: {addon.get('name', 'unknown')} = ${price:.2f}\n"
            
            # Tips
            tips = session.get('tips', 0)
            total_tips += tips
            if tips > 0:
                report += f"  Tips: ${tips:.2f}\n"
        
        report += "\n" + "=" * 50 + "\n"
        report += "DAILY SUMMARY\n"
        report += f"Total Earnings: ${total_earnings:.2f}\n"
        report += f"Total Tips: ${total_tips:.2f}\n"
        report += f"Gross Total: ${total_earnings + total_tips:.2f}\n\n"
        report += "Services Breakdown:\n"
        for service_type, count in services_count.items():
            report += f"  {service_type}: {count}\n"
        
        return report
    
    def generate_weekly_report(self, week_start: str = None) -> str:
        """Generate a weekly report"""
        if week_start is None:
            week_start = (datetime.now() - timedelta(days=datetime.now().weekday())).strftime('%Y-%m-%d')
        
        week_end = (datetime.strptime(week_start, '%Y-%m-%d') + timedelta(days=6)).strftime('%Y-%m-%d')
        self.filter_by_date_range(week_start, week_end)
        
        report = f"WEEKLY EARNINGS REPORT\n"
        report += f"Week of {week_start} to {week_end}\n"
        report += "=" * 50 + "\n\n"
        
        daily_totals = self.calculate_daily_totals()
        
        total_sessions = 0
        total_earnings = 0.0
        total_tips = 0.0
        
        for date in sorted(daily_totals.keys()):
            data = daily_totals[date]
            total_sessions += data['sessions']
            total_earnings += data['earnings']
            total_tips += data['tips']
            
            report += f"{date}: {data['sessions']} sessions, ${data['earnings']:.2f} (Tips: ${data['tips']:.2f})\n"
        
        report += "\n" + "=" * 50 + "\n"
        report += f"Weekly Totals:\n"
        report += f"  Total Sessions: {total_sessions}\n"
        report += f"  Total Earnings: ${total_earnings:.2f}\n"
        report += f"  Total Tips: ${total_tips:.2f}\n"
        report += f"  Gross Total: ${total_earnings + total_tips:.2f}\n"
        
        return report
    
    def generate_monthly_report(self, year_month: str = None) -> str:
        """Generate a monthly report (YYYY-MM format)"""
        if year_month is None:
            year_month = datetime.now().strftime('%Y-%m')
        
        year, month = year_month.split('-')
        month_start = f"{year_month}-01"
        
        # Get last day of month
        next_month = datetime.strptime(month_start, '%Y-%m-%d') + timedelta(days=32)
        month_end = (next_month.replace(day=1) - timedelta(days=1)).strftime('%Y-%m-%d')
        
        self.filter_by_date_range(month_start, month_end)
        
        report = f"MONTHLY EARNINGS REPORT\n"
        report += f"Month of {year_month}\n"
        report += "=" * 50 + "\n\n"
        
        daily_totals = self.calculate_daily_totals()
        
        total_sessions = 0
        total_earnings = 0.0
        total_tips = 0.0
        
        for date in sorted(daily_totals.keys()):
            data = daily_totals[date]
            total_sessions += data['sessions']
            total_earnings += data['earnings']
            total_tips += data['tips']
            
            if data['sessions'] > 0:
                report += f"{date}: {data['sessions']} sessions, ${data['earnings']:.2f} (Tips: ${data['tips']:.2f})\n"
        
        report += "\n" + "=" * 50 + "\n"
        report += f"Monthly Totals:\n"
        report += f"  Working Days: {len([d for d in daily_totals if daily_totals[d]['sessions'] > 0])}\n"
        report += f"  Total Sessions: {total_sessions}\n"
        report += f"  Total Earnings: ${total_earnings:.2f}\n"
        report += f"  Total Tips: ${total_tips:.2f}\n"
        report += f"  Gross Total: ${total_earnings + total_tips:.2f}\n"
        
        if total_sessions > 0:
            report += f"  Average per Session: ${(total_earnings / total_sessions):.2f}\n"
            report += f"  Average per Working Day: ${(total_earnings / len([d for d in daily_totals if daily_totals[d]['sessions'] > 0])):.2f}\n"
        
        return report

def load_sessions_from_backup(backup_file: str) -> List[Dict]:
    """Load sessions from a JSON backup file"""
    try:
        with open(backup_file, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Backup file not found: {backup_file}")
        return []
    except json.JSONDecodeError:
        print(f"Invalid JSON in backup file: {backup_file}")
        return []

def main():
    # Example usage with backup file
    backup_file = "earnings-backup-2026-02-17.json"
    
    sessions = load_sessions_from_backup(backup_file)
    
    if sessions:
        # Generate daily report
        report_gen = EarningsReport(sessions, location='halo')
        daily_report = report_gen.generate_daily_report('2026-02-17')
        print(daily_report)
        
        # Save to file
        with open('daily_report.txt', 'w') as f:
            f.write(daily_report)
        print("\nDaily report saved to daily_report.txt")
        
        # Generate weekly report
        weekly_report = EarningsReport(sessions).generate_weekly_report()
        with open('weekly_report.txt', 'w') as f:
            f.write(weekly_report)
        print("Weekly report saved to weekly_report.txt")

if __name__ == '__main__':
    main()
