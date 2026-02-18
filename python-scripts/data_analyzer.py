"""
Data Analyzer for Earnings Tracker
Analyzes trends, statistics, and insights from earnings data
"""

import json
from datetime import datetime, timedelta
from typing import List, Dict, Tuple
from collections import defaultdict
import statistics

class EarningsAnalyzer:
    def __init__(self, sessions_data: List[Dict]):
        """
        Initialize analyzer
        
        Args:
            sessions_data: List of session dictionaries with complete data
        """
        self.sessions = sessions_data
        self.dates = sorted(list(set(s.get('date', '') for s in sessions_data)))
    
    def get_total_earnings(self) -> float:
        """Calculate total earnings across all sessions"""
        total = 0.0
        for session in self.sessions:
            for service in session.get('services', []):
                if 'rate' in service and 'duration' in service:
                    total += (service['rate'] / 60) * service['duration']
            
            for addon in session.get('addOns', []):
                total += addon.get('price', 0)
            
            total += session.get('tips', 0)
        
        return total
    
    def get_earnings_by_location(self) -> Dict[str, float]:
        """Get total earnings broken down by business location"""
        earnings_by_location = defaultdict(float)
        
        for session in self.sessions:
            location = session.get('location', 'unknown')
            session_earnings = 0.0
            
            for service in session.get('services', []):
                if 'rate' in service and 'duration' in service:
                    session_earnings += (service['rate'] / 60) * service['duration']
            
            for addon in session.get('addOns', []):
                session_earnings += addon.get('price', 0)
            
            session_earnings += session.get('tips', 0)
            earnings_by_location[location] += session_earnings
        
        return dict(earnings_by_location)
    
    def get_daily_averages(self) -> Dict[str, float]:
        """Get average earnings per day"""
        daily_earnings = defaultdict(float)
        daily_counts = defaultdict(int)
        
        for session in self.sessions:
            date = session.get('date', 'unknown')
            session_earnings = 0.0
            
            for service in session.get('services', []):
                if 'rate' in service and 'duration' in service:
                    session_earnings += (service['rate'] / 60) * service['duration']
            
            for addon in session.get('addOns', []):
                session_earnings += addon.get('price', 0)
            
            session_earnings += session.get('tips', 0)
            
            daily_earnings[date] += session_earnings
            daily_counts[date] += 1
        
        return {date: daily_earnings[date] for date in daily_earnings}
    
    def get_session_statistics(self) -> Dict:
        """Get detailed statistics about sessions"""
        if not self.sessions:
            return {
                'totalSessions': 0,
                'averageSessionEarnings': 0.0,
                'medianSessionEarnings': 0.0,
                'minSessionEarnings': 0.0,
                'maxSessionEarnings': 0.0,
                'standardDeviation': 0.0,
            }
        
        session_earnings = []
        
        for session in self.sessions:
            session_total = 0.0
            
            for service in session.get('services', []):
                if 'rate' in service and 'duration' in service:
                    session_total += (service['rate'] / 60) * service['duration']
            
            for addon in session.get('addOns', []):
                session_total += addon.get('price', 0)
            
            session_total += session.get('tips', 0)
            session_earnings.append(session_total)
        
        return {
            'totalSessions': len(session_earnings),
            'averageSessionEarnings': statistics.mean(session_earnings),
            'medianSessionEarnings': statistics.median(session_earnings),
            'minSessionEarnings': min(session_earnings),
            'maxSessionEarnings': max(session_earnings),
            'standardDeviation': statistics.stdev(session_earnings) if len(session_earnings) > 1 else 0.0,
        }
    
    def get_service_breakdown(self) -> Dict[str, int]:
        """Get count of each service type"""
        service_counts = defaultdict(int)
        
        for session in self.sessions:
            for service in session.get('services', []):
                service_type = service.get('type', 'unknown')
                service_counts[service_type] += 1
        
        return dict(service_counts)
    
    def get_addon_revenue(self) -> Dict[str, float]:
        """Get revenue from add-ons"""
        addon_revenue = defaultdict(float)
        
        for session in self.sessions:
            for addon in session.get('addOns', []):
                addon_name = addon.get('name', 'unknown')
                addon_price = addon.get('price', 0)
                addon_revenue[addon_name] += addon_price
        
        return dict(addon_revenue)
    
    def get_tip_statistics(self) -> Dict:
        """Get tip statistics"""
        tips = [s.get('tips', 0) for s in self.sessions if s.get('tips', 0) > 0]
        
        if not tips:
            return {
                'totalTips': 0.0,
                'averageTip': 0.0,
                'medianTip': 0.0,
                'sessionsWithTips': 0,
                'tipPercentage': 0.0,
            }
        
        earnings = self.get_total_earnings() - sum(tips)  # Remove tips from earnings
        
        return {
            'totalTips': sum(tips),
            'averageTip': statistics.mean(tips),
            'medianTip': statistics.median(tips),
            'sessionsWithTips': len(tips),
            'tipPercentage': (sum(tips) / earnings * 100) if earnings > 0 else 0.0,
        }
    
    def get_daily_metrics(self) -> Dict[str, Dict]:
        """Get detailed metrics for each day"""
        daily_metrics = defaultdict(lambda: {
            'sessions': 0,
            'earnings': 0.0,
            'tips': 0.0,
            'addons': 0.0,
        })
        
        for session in self.sessions:
            date = session.get('date', 'unknown')
            
            daily_metrics[date]['sessions'] += 1
            
            for service in session.get('services', []):
                if 'rate' in service and 'duration' in service:
                    daily_metrics[date]['earnings'] += (service['rate'] / 60) * service['duration']
            
            for addon in session.get('addOns', []):
                daily_metrics[date]['addons'] += addon.get('price', 0)
            
            daily_metrics[date]['tips'] += session.get('tips', 0)
        
        return dict(daily_metrics)
    
    def get_best_days(self, limit: int = 5) -> List[Tuple[str, float]]:
        """Get the best earning days"""
        daily_metrics = self.get_daily_metrics()
        
        days = [
            (date, daily_metrics[date]['earnings'] + daily_metrics[date]['addons'] + daily_metrics[date]['tips'])
            for date in daily_metrics
        ]
        
        return sorted(days, key=lambda x: x[1], reverse=True)[:limit]
    
    def get_productivity_score(self) -> Dict:
        """Calculate productivity metrics"""
        if not self.sessions:
            return {'score': 0, 'workDays': 0, 'sessionsPerDay': 0}
        
        daily_metrics = self.get_daily_metrics()
        work_days = len(daily_metrics)
        total_sessions = len(self.sessions)
        
        return {
            'score': (total_sessions / work_days) if work_days > 0 else 0,
            'workDays': work_days,
            'totalSessions': total_sessions,
            'sessionsPerDay': total_sessions / work_days if work_days > 0 else 0,
            'averageDailyEarnings': self.get_total_earnings() / work_days if work_days > 0 else 0,
        }
    
    def generate_summary_report(self) -> str:
        """Generate a comprehensive summary report"""
        report = "EARNINGS ANALYSIS SUMMARY\n"
        report += "=" * 60 + "\n\n"
        
        # Overall statistics
        report += "OVERALL STATISTICS\n"
        report += "-" * 40 + "\n"
        report += f"Total Sessions: {len(self.sessions)}\n"
        report += f"Date Range: {self.dates[0] if self.dates else 'N/A'} to {self.dates[-1] if self.dates else 'N/A'}\n"
        report += f"Total Earnings: ${self.get_total_earnings():.2f}\n\n"
        
        # Location breakdown
        report += "EARNINGS BY LOCATION\n"
        report += "-" * 40 + "\n"
        for location, earnings in self.get_earnings_by_location().items():
            report += f"{location}: ${earnings:.2f}\n"
        report += "\n"
        
        # Session statistics
        report += "SESSION STATISTICS\n"
        report += "-" * 40 + "\n"
        stats = self.get_session_statistics()
        report += f"Average per Session: ${stats['averageSessionEarnings']:.2f}\n"
        report += f"Median per Session: ${stats['medianSessionEarnings']:.2f}\n"
        report += f"Range: ${stats['minSessionEarnings']:.2f} - ${stats['maxSessionEarnings']:.2f}\n"
        report += f"Std Dev: ${stats['standardDeviation']:.2f}\n\n"
        
        # Service breakdown
        report += "SERVICE BREAKDOWN\n"
        report += "-" * 40 + "\n"
        for service, count in self.get_service_breakdown().items():
            report += f"{service}: {count}\n"
        report += "\n"
        
        # Tips
        report += "TIP STATISTICS\n"
        report += "-" * 40 + "\n"
        tips = self.get_tip_statistics()
        report += f"Total Tips: ${tips['totalTips']:.2f}\n"
        report += f"Average Tip: ${tips['averageTip']:.2f}\n"
        report += f"Sessions with Tips: {tips['sessionsWithTips']}\n"
        report += f"Tip as % of Earnings: {tips['tipPercentage']:.1f}%\n\n"
        
        # Best days
        report += "BEST EARNING DAYS\n"
        report += "-" * 40 + "\n"
        for i, (date, earnings) in enumerate(self.get_best_days(5), 1):
            report += f"{i}. {date}: ${earnings:.2f}\n"
        report += "\n"
        
        # Productivity
        report += "PRODUCTIVITY METRICS\n"
        report += "-" * 40 + "\n"
        productivity = self.get_productivity_score()
        report += f"Working Days: {productivity['workDays']}\n"
        report += f"Average Sessions/Day: {productivity['sessionsPerDay']:.1f}\n"
        report += f"Average Earnings/Day: ${productivity['averageDailyEarnings']:.2f}\n"
        
        return report

def load_sessions_from_backup(backup_file: str) -> List[Dict]:
    """Load sessions from a JSON backup file"""
    try:
        with open(backup_file, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Backup file not found: {backup_file}")
        return []

def main():
    # Example usage
    backup_file = "earnings-backup-2026-02-17.json"
    
    sessions = load_sessions_from_backup(backup_file)
    
    if sessions:
        analyzer = EarningsAnalyzer(sessions)
        summary = analyzer.generate_summary_report()
        print(summary)
        
        # Save to file
        with open('analysis_summary.txt', 'w') as f:
            f.write(summary)
        print("\nAnalysis saved to analysis_summary.txt")

if __name__ == '__main__':
    main()
