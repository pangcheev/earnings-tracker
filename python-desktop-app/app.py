"""
Earnings Tracker Desktop Application
Built with PyQt6
"""

import sys
import json
from pathlib import Path
from datetime import datetime, timedelta
from typing import List, Dict

from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QTabWidget, QTableWidget, QTableWidgetItem, QPushButton, QLabel,
    QDateEdit, QComboBox, QMessageBox, QFileDialog, QProgressBar,
    QStatusBar, QHeaderView
)
from PyQt6.QtCore import Qt, QDate, QTimer
from PyQt6.QtGui import QColor, QFont, QIcon
from PyQt6.QtChart import QChart, QChartView, QBarSeries, QBarSet, QBarCategoryAxis, QValueAxis
from PyQt6.QtCore import Qt as QtCore

class EarningsTrackerApp(QMainWindow):
    def __init__(self):
        super().__init__()
        self.sessions = []
        
        self.setWindowTitle("Earnings Tracker Desktop")
        self.setGeometry(100, 100, 1200, 800)
        
        # Create central widget and main layout
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QVBoxLayout()
        central_widget.setLayout(main_layout)
        
        # Create tabs
        tabs = QTabWidget()
        
        # Tab 1: Dashboard
        self.dashboard_tab = self.create_dashboard_tab()
        tabs.addTab(self.dashboard_tab, "Dashboard")
        
        # Tab 2: Sessions
        self.sessions_tab = self.create_sessions_tab()
        tabs.addTab(self.sessions_tab, "Sessions")
        
        # Tab 3: Reports
        self.reports_tab = self.create_reports_tab()
        tabs.addTab(self.reports_tab, "Reports")
        
        # Tab 4: Analytics
        self.analytics_tab = self.create_analytics_tab()
        tabs.addTab(self.analytics_tab, "Analytics")
        
        main_layout.addWidget(tabs)
        
        # Create status bar
        self.status_bar = QStatusBar()
        self.setStatusBar(self.status_bar)
        
        # Create menu bar
        menubar = self.menuBar()
        
        file_menu = menubar.addMenu("File")
        file_menu.addAction("Open Backup", self.open_backup)
        file_menu.addAction("Export CSV", self.export_csv)
        file_menu.addAction("Export Excel", self.export_excel)
        file_menu.addAction("Exit", self.close)
        
        # Load initial data
        self.load_backup()
    
    def create_dashboard_tab(self) -> QWidget:
        """Create dashboard tab"""
        widget = QWidget()
        layout = QVBoxLayout()
        
        # Statistics
        title = QLabel("Earnings Summary")
        title.setFont(QFont("Arial", 14, QFont.Weight.Bold))
        layout.addWidget(title)
        
        # Summary cards layout
        cards_layout = QHBoxLayout()
        
        # Total earnings
        self.total_earnings_label = QLabel("Total Earnings: $0.00")
        self.total_earnings_label.setFont(QFont("Arial", 12))
        cards_layout.addWidget(self.total_earnings_label)
        
        # Total sessions
        self.total_sessions_label = QLabel("Total Sessions: 0")
        self.total_sessions_label.setFont(QFont("Arial", 12))
        cards_layout.addWidget(self.total_sessions_label)
        
        # Average per session
        self.avg_per_session_label = QLabel("Average/Session: $0.00")
        self.avg_per_session_label.setFont(QFont("Arial", 12))
        cards_layout.addWidget(self.avg_per_session_label)
        
        # Total tips
        self.total_tips_label = QLabel("Total Tips: $0.00")
        self.total_tips_label.setFont(QFont("Arial", 12))
        cards_layout.addWidget(self.total_tips_label)
        
        layout.addLayout(cards_layout)
        layout.addSpacing(20)
        
        # Chart placeholder
        chart_label = QLabel("Chart (Coming Soon)")
        chart_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(chart_label)
        
        layout.addStretch()
        widget.setLayout(layout)
        return widget
    
    def create_sessions_tab(self) -> QWidget:
        """Create sessions management tab"""
        widget = QWidget()
        layout = QVBoxLayout()
        
        # Filter controls
        filter_layout = QHBoxLayout()
        
        filter_layout.addWidget(QLabel("Location:"))
        self.location_combo = QComboBox()
        self.location_combo.addItems(["All", "Halo Therapies", "Soul Bridge Healing"])
        self.location_combo.currentTextChanged.connect(self.filter_sessions)
        filter_layout.addWidget(self.location_combo)
        
        filter_layout.addWidget(QLabel("From:"))
        self.from_date = QDateEdit()
        self.from_date.setDate(QDate.currentDate().addMonths(-1))
        self.from_date.dateChanged.connect(self.filter_sessions)
        filter_layout.addWidget(self.from_date)
        
        filter_layout.addWidget(QLabel("To:"))
        self.to_date = QDateEdit()
        self.to_date.setDate(QDate.currentDate())
        self.to_date.dateChanged.connect(self.filter_sessions)
        filter_layout.addWidget(self.to_date)
        
        filter_layout.addStretch()
        layout.addLayout(filter_layout)
        
        # Sessions table
        self.sessions_table = QTableWidget()
        self.sessions_table.setColumnCount(7)
        self.sessions_table.setHorizontalHeaderLabels([
            "Date", "Location", "Services", "Earnings", "Tips", "Add-ons", "Total"
        ])
        self.sessions_table.horizontalHeader().setSectionResizeMode(QHeaderView.ResizeMode.Stretch)
        layout.addWidget(self.sessions_table)
        
        # Buttons
        button_layout = QHBoxLayout()
        button_layout.addStretch()
        
        export_btn = QPushButton("Export Table")
        export_btn.clicked.connect(self.export_sessions_table)
        button_layout.addWidget(export_btn)
        
        layout.addLayout(button_layout)
        
        widget.setLayout(layout)
        return widget
    
    def create_reports_tab(self) -> QWidget:
        """Create reports tab"""
        widget = QWidget()
        layout = QVBoxLayout()
        
        title = QLabel("Generate Reports")
        title.setFont(QFont("Arial", 14, QFont.Weight.Bold))
        layout.addWidget(title)
        
        # Report selection
        report_layout = QHBoxLayout()
        
        report_layout.addWidget(QLabel("Report Type:"))
        self.report_type_combo = QComboBox()
        self.report_type_combo.addItems([
            "Daily Summary",
            "Weekly Summary",
            "Monthly Summary",
            "Custom Date Range"
        ])
        report_layout.addWidget(self.report_type_combo)
        
        date_label = QLabel("Date:")
        report_layout.addWidget(date_label)
        
        self.report_date = QDateEdit()
        self.report_date.setDate(QDate.currentDate())
        report_layout.addWidget(self.report_date)
        
        report_layout.addStretch()
        layout.addLayout(report_layout)
        
        # Report text area
        self.report_text = None  # Will be populated
        
        # Buttons
        button_layout = QHBoxLayout()
        
        generate_btn = QPushButton("Generate Report")
        generate_btn.clicked.connect(self.generate_report)
        button_layout.addWidget(generate_btn)
        
        save_btn = QPushButton("Save Report")
        save_btn.clicked.connect(self.save_report)
        button_layout.addWidget(save_btn)
        
        button_layout.addStretch()
        layout.addLayout(button_layout)
        
        # Report output (text display - simplified for now)
        report_label = QLabel("Report output will appear here")
        report_label.setAlignment(Qt.AlignmentFlag.AlignTop)
        layout.addWidget(report_label)
        
        widget.setLayout(layout)
        return widget
    
    def create_analytics_tab(self) -> QWidget:
        """Create analytics tab"""
        widget = QWidget()
        layout = QVBoxLayout()
        
        title = QLabel("Analytics & Insights")
        title.setFont(QFont("Arial", 14, QFont.Weight.Bold))
        layout.addWidget(title)
        
        # Statistics table
        self.analytics_table = QTableWidget()
        self.analytics_table.setColumnCount(2)
        self.analytics_table.setHorizontalHeaderLabels(["Metric", "Value"])
        layout.addWidget(self.analytics_table)
        
        # Buttons
        button_layout = QHBoxLayout()
        
        refresh_btn = QPushButton("Refresh Analytics")
        refresh_btn.clicked.connect(self.refresh_analytics)
        button_layout.addWidget(refresh_btn)
        
        button_layout.addStretch()
        layout.addLayout(button_layout)
        
        widget.setLayout(layout)
        return widget
    
    def load_backup(self):
        """Load sessions from backup file"""
        # Try to find most recent backup
        backup_dir = Path('.')
        backups = sorted(
            backup_dir.glob('earnings-backup-*.json'),
            reverse=True
        )
        
        if backups:
            try:
                with open(backups[0], 'r') as f:
                    self.sessions = json.load(f)
                self.status_bar.showMessage(f"Loaded {len(self.sessions)} sessions from {backups[0].name}")
                self.update_dashboard()
                self.refresh_sessions_table()
                self.refresh_analytics()
            except Exception as e:
                QMessageBox.error(self, "Error", f"Failed to load backup: {str(e)}")
        else:
            self.status_bar.showMessage("No backup files found")
    
    def open_backup(self):
        """Open backup file dialog"""
        file_dialog = QFileDialog()
        file_path, _ = file_dialog.getOpenFileName(
            self, "Open Backup", "", "JSON Files (*.json)"
        )
        
        if file_path:
            try:
                with open(file_path, 'r') as f:
                    self.sessions = json.load(f)
                self.status_bar.showMessage(f"Loaded {len(self.sessions)} sessions")
                self.update_dashboard()
                self.refresh_sessions_table()
                self.refresh_analytics()
            except Exception as e:
                QMessageBox.error(self, "Error", f"Failed to load file: {str(e)}")
    
    def update_dashboard(self):
        """Update dashboard statistics"""
        if not self.sessions:
            self.total_earnings_label.setText("Total Earnings: $0.00")
            self.total_sessions_label.setText("Total Sessions: 0")
            self.avg_per_session_label.setText("Average/Session: $0.00")
            self.total_tips_label.setText("Total Tips: $0.00")
            return
        
        total_earnings = 0.0
        total_tips = 0.0
        
        for session in self.sessions:
            for service in session.get('services', []):
                if 'rate' in service and 'duration' in service:
                    total_earnings += (service['rate'] / 60) * service['duration']
            
            for addon in session.get('addOns', []):
                total_earnings += addon.get('price', 0)
            
            total_tips += session.get('tips', 0)
        
        self.total_earnings_label.setText(f"Total Earnings: ${total_earnings:.2f}")
        self.total_sessions_label.setText(f"Total Sessions: {len(self.sessions)}")
        
        if self.sessions:
            avg = (total_earnings + total_tips) / len(self.sessions)
            self.avg_per_session_label.setText(f"Average/Session: ${avg:.2f}")
        
        self.total_tips_label.setText(f"Total Tips: ${total_tips:.2f}")
    
    def refresh_sessions_table(self):
        """Refresh sessions table"""
        self.sessions_table.setRowCount(0)
        
        for session in sorted(self.sessions, key=lambda x: x.get('date', ''), reverse=True):
            row = self.sessions_table.rowCount()
            self.sessions_table.insertRow(row)
            
            date = session.get('date', '')
            location = session.get('location', '')
            services = ", ".join([s.get('type', '') for s in session.get('services', [])])
            
            earnings = 0.0
            for service in session.get('services', []):
                if 'rate' in service and 'duration' in service:
                    earnings += (service['rate'] / 60) * service['duration']
            
            tips = session.get('tips', 0)
            addons_total = sum(a.get('price', 0) for a in session.get('addOns', []))
            total = earnings + addons_total + tips
            
            self.sessions_table.setItem(row, 0, QTableWidgetItem(date))
            self.sessions_table.setItem(row, 1, QTableWidgetItem(location))
            self.sessions_table.setItem(row, 2, QTableWidgetItem(services))
            self.sessions_table.setItem(row, 3, QTableWidgetItem(f"${earnings:.2f}"))
            self.sessions_table.setItem(row, 4, QTableWidgetItem(f"${tips:.2f}"))
            self.sessions_table.setItem(row, 5, QTableWidgetItem(f"${addons_total:.2f}"))
            self.sessions_table.setItem(row, 6, QTableWidgetItem(f"${total:.2f}"))
    
    def filter_sessions(self):
        """Filter sessions based on criteria"""
        # Simplified - would implement actual filtering
        self.refresh_sessions_table()
    
    def export_sessions_table(self):
        """Export sessions table to CSV"""
        file_dialog = QFileDialog()
        file_path, _ = file_dialog.getSaveFileName(
            self, "Save Sessions", "", "CSV Files (*.csv)"
        )
        
        if file_path:
            try:
                import csv
                with open(file_path, 'w', newline='') as f:
                    writer = csv.writer(f)
                    writer.writerow(["Date", "Location", "Services", "Earnings", "Tips", "Add-ons", "Total"])
                    
                    for row in range(self.sessions_table.rowCount()):
                        row_data = []
                        for col in range(self.sessions_table.columnCount()):
                            item = self.sessions_table.item(row, col)
                            row_data.append(item.text() if item else "")
                        writer.writerow(row_data)
                
                QMessageBox.information(self, "Success", f"Exported to {file_path}")
            except Exception as e:
                QMessageBox.error(self, "Error", f"Failed to export: {str(e)}")
    
    def generate_report(self):
        """Generate report based on selection"""
        report_type = self.report_type_combo.currentText()
        QMessageBox.information(self, "Report", f"Generating {report_type}...")
    
    def save_report(self):
        """Save generated report"""
        QMessageBox.information(self, "Save", "Report would be saved here")
    
    def export_csv(self):
        """Export all sessions to CSV"""
        self.export_sessions_table()
    
    def export_excel(self):
        """Export all sessions to Excel"""
        QMessageBox.information(self, "Export", "Excel export would be generated here")
    
    def refresh_analytics(self):
        """Refresh analytics table"""
        if not self.sessions:
            return
        
        self.analytics_table.setRowCount(0)
        
        metrics = [
            ("Total Sessions", str(len(self.sessions))),
            ("Unique Dates", str(len(set(s.get('date', '') for s in self.sessions)))),
            ("Halo Sessions", str(len([s for s in self.sessions if s.get('location') == 'halo']))),
            ("Soul Bridge Sessions", str(len([s for s in self.sessions if s.get('location') == 'soul-bridge']))),
        ]
        
        for metric, value in metrics:
            row = self.analytics_table.rowCount()
            self.analytics_table.insertRow(row)
            self.analytics_table.setItem(row, 0, QTableWidgetItem(metric))
            self.analytics_table.setItem(row, 1, QTableWidgetItem(value))

def main():
    app = QApplication(sys.argv)
    window = EarningsTrackerApp()
    window.show()
    sys.exit(app.exec())

if __name__ == '__main__':
    main()
