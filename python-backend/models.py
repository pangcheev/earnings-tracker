from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date
import json

db = SQLAlchemy()

class Session(db.Model):
    """Session model - represents a single therapy session"""
    __tablename__ = 'sessions'
    
    id = db.Column(db.String(50), primary_key=True)
    location = db.Column(db.String(50), nullable=False)  # 'soul-bridge' or 'halo'
    date = db.Column(db.Date, nullable=False, index=True)
    
    # Services (JSON array)
    services_json = db.Column(db.Text, nullable=False, default='[]')
    
    # Add-ons (JSON array)
    addons_json = db.Column(db.Text, nullable=False, default='[]')
    
    # Tips and review
    tips = db.Column(db.Float, nullable=False, default=0.0)
    review = db.Column(db.Text, nullable=True)
    rating = db.Column(db.Integer, nullable=True)
    has_client_review = db.Column(db.Boolean, nullable=False, default=False)
    
    # Metadata
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    @property
    def services(self):
        """Parse services JSON"""
        return json.loads(self.services_json)
    
    @services.setter
    def services(self, value):
        """Set services as JSON"""
        self.services_json = json.dumps(value)
    
    @property
    def addons(self):
        """Parse add-ons JSON"""
        return json.loads(self.addons_json)
    
    @addons.setter
    def addons(self, value):
        """Set add-ons as JSON"""
        self.addons_json = json.dumps(value)
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'location': self.location,
            'date': self.date.isoformat(),
            'services': self.services,
            'addOns': self.addons,
            'tips': self.tips,
            'review': self.review,
            'rating': self.rating,
            'hasClientReview': self.has_client_review,
        }
    
    def __repr__(self):
        return f'<Session {self.id} on {self.date}>'

class ClosedDate(db.Model):
    """Tracks which dates have been closed out"""
    __tablename__ = 'closed_dates'
    
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False, unique=True, index=True)
    closed_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    is_closed = db.Column(db.Boolean, nullable=False, default=True)
    
    def to_dict(self):
        return {
            'date': self.date.isoformat(),
            'isClosed': self.is_closed,
            'closedAt': self.closed_at.isoformat(),
        }
    
    def __repr__(self):
        return f'<ClosedDate {self.date} - {"closed" if self.is_closed else "reopened"}>'

class SyncLog(db.Model):
    """Tracks sync events between devices"""
    __tablename__ = 'sync_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    device_id = db.Column(db.String(100), nullable=False, index=True)
    action = db.Column(db.String(50), nullable=False)  # 'upload', 'download', 'sync'
    session_count = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, index=True)
    
    def to_dict(self):
        return {
            'deviceId': self.device_id,
            'action': self.action,
            'sessionCount': self.session_count,
            'timestamp': self.timestamp.isoformat(),
        }
    
    def __repr__(self):
        return f'<SyncLog {self.device_id} - {self.action} at {self.timestamp}>'
