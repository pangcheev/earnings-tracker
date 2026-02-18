from flask import Blueprint, jsonify, request
from datetime import datetime, date
from sqlalchemy import and_, or_

from models import db, Session, ClosedDate, SyncLog

api_bp = Blueprint('api', __name__)

# ===== SESSION ENDPOINTS =====

@api_bp.route('/sessions', methods=['GET'])
def get_sessions():
    """Get all sessions, optionally filtered by date range"""
    start_date = request.args.get('startDate')
    end_date = request.args.get('endDate')
    location = request.args.get('location')
    
    query = Session.query
    
    if start_date:
        query = query.filter(Session.date >= start_date)
    if end_date:
        query = query.filter(Session.date <= end_date)
    if location:
        query = query.filter(Session.location == location)
    
    sessions = query.order_by(Session.date.desc()).all()
    return jsonify([s.to_dict() for s in sessions])

@api_bp.route('/sessions/<date_str>', methods=['GET'])
def get_sessions_by_date(date_str):
    """Get all sessions for a specific date"""
    try:
        target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    sessions = Session.query.filter(Session.date == target_date).order_by(Session.id.desc()).all()
    return jsonify([s.to_dict() for s in sessions])

@api_bp.route('/sessions', methods=['POST'])
def create_session():
    """Create a new session"""
    data = request.get_json()
    
    if not data or not all(k in data for k in ['id', 'location', 'date']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Check if session already exists
    existing = Session.query.filter_by(id=data['id']).first()
    if existing:
        return jsonify({'error': 'Session already exists'}), 409
    
    try:
        target_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    session = Session(
        id=data['id'],
        location=data['location'],
        date=target_date,
        services=data.get('services', []),
        addons=data.get('addOns', []),
        tips=float(data.get('tips', 0)),
        review=data.get('review'),
        rating=data.get('rating'),
        has_client_review=data.get('hasClientReview', False),
    )
    
    db.session.add(session)
    db.session.commit()
    
    return jsonify(session.to_dict()), 201

@api_bp.route('/sessions/<session_id>', methods=['PUT'])
def update_session(session_id):
    """Update an existing session"""
    session = Session.query.filter_by(id=session_id).first()
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    
    data = request.get_json()
    
    if 'date' in data:
        try:
            session.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    if 'location' in data:
        session.location = data['location']
    if 'services' in data:
        session.services = data['services']
    if 'addOns' in data:
        session.addons = data['addOns']
    if 'tips' in data:
        session.tips = float(data['tips'])
    if 'review' in data:
        session.review = data['review']
    if 'rating' in data:
        session.rating = data['rating']
    if 'hasClientReview' in data:
        session.has_client_review = data['hasClientReview']
    
    db.session.commit()
    return jsonify(session.to_dict())

@api_bp.route('/sessions/<session_id>', methods=['DELETE'])
def delete_session(session_id):
    """Delete a session"""
    session = Session.query.filter_by(id=session_id).first()
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    
    db.session.delete(session)
    db.session.commit()
    
    return '', 204

# ===== CLOSED DATES ENDPOINTS =====

@api_bp.route('/closed-dates', methods=['GET'])
def get_closed_dates():
    """Get all closed dates"""
    closed_dates = ClosedDate.query.filter_by(is_closed=True).all()
    return jsonify({d.date.isoformat(): True for d in closed_dates})

@api_bp.route('/closed-dates/<date_str>', methods=['POST'])
def close_date(date_str):
    """Close a date"""
    try:
        target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    closed_date = ClosedDate.query.filter_by(date=target_date).first()
    if not closed_date:
        closed_date = ClosedDate(date=target_date, is_closed=True)
        db.session.add(closed_date)
    else:
        closed_date.is_closed = True
        closed_date.closed_at = datetime.utcnow()
    
    db.session.commit()
    return jsonify(closed_date.to_dict()), 201

@api_bp.route('/closed-dates/<date_str>', methods=['DELETE'])
def reopen_date(date_str):
    """Reopen a date"""
    try:
        target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    closed_date = ClosedDate.query.filter_by(date=target_date).first()
    if closed_date:
        closed_date.is_closed = False
        db.session.commit()
        return jsonify(closed_date.to_dict())
    
    return jsonify({'error': 'Date not found'}), 404

# ===== SYNC ENDPOINTS =====

@api_bp.route('/sync', methods=['POST'])
def sync_sessions():
    """Sync sessions from device"""
    data = request.get_json()
    
    if not data or 'sessions' not in data:
        return jsonify({'error': 'Missing sessions data'}), 400
    
    device_id = data.get('deviceId', 'unknown')
    sessions_data = data['sessions']
    
    # Upsert sessions
    for session_data in sessions_data:
        existing = Session.query.filter_by(id=session_data['id']).first()
        
        try:
            target_date = datetime.strptime(session_data['date'], '%Y-%m-%d').date()
        except ValueError:
            continue
        
        if existing:
            existing.services = session_data.get('services', [])
            existing.addons = session_data.get('addOns', [])
            existing.tips = float(session_data.get('tips', 0))
            existing.review = session_data.get('review')
            existing.rating = session_data.get('rating')
            existing.has_client_review = session_data.get('hasClientReview', False)
            existing.date = target_date
        else:
            session = Session(
                id=session_data['id'],
                location=session_data['location'],
                date=target_date,
                services=session_data.get('services', []),
                addons=session_data.get('addOns', []),
                tips=float(session_data.get('tips', 0)),
                review=session_data.get('review'),
                rating=session_data.get('rating'),
                has_client_review=session_data.get('hasClientReview', False),
            )
            db.session.add(session)
    
    # Log sync
    sync_log = SyncLog(
        device_id=device_id,
        action='upload',
        session_count=len(sessions_data)
    )
    db.session.add(sync_log)
    db.session.commit()
    
    # Return all sessions
    all_sessions = Session.query.order_by(Session.date.desc()).all()
    return jsonify({
        'status': 'success',
        'synced': len(sessions_data),
        'sessions': [s.to_dict() for s in all_sessions]
    })

@api_bp.route('/sync-status', methods=['GET'])
def get_sync_status():
    """Get sync statistics"""
    total_sessions = Session.query.count()
    session_count_by_date = db.session.query(
        Session.date,
        db.func.count(Session.id)
    ).group_by(Session.date).all()
    
    return jsonify({
        'totalSessions': total_sessions,
        'sessionsByDate': {str(d): c for d, c in session_count_by_date},
        'lastSync': None,
    })

# ===== STATS ENDPOINTS =====

@api_bp.route('/stats', methods=['GET'])
def get_stats():
    """Get earnings statistics"""
    start_date = request.args.get('startDate')
    end_date = request.args.get('endDate')
    location = request.args.get('location')
    
    query = Session.query
    
    if start_date:
        query = query.filter(Session.date >= start_date)
    if end_date:
        query = query.filter(Session.date <= end_date)
    if location:
        query = query.filter(Session.location == location)
    
    sessions = query.all()
    
    stats = {
        'totalSessions': len(sessions),
        'totalEarnings': sum(float(s.tips) for s in sessions),
        'sessionsByLocation': {},
        'sessionsByDate': {},
    }
    
    for session in sessions:
        # By location
        if session.location not in stats['sessionsByLocation']:
            stats['sessionsByLocation'][session.location] = 0
        stats['sessionsByLocation'][session.location] += 1
        
        # By date
        date_key = session.date.isoformat()
        if date_key not in stats['sessionsByDate']:
            stats['sessionsByDate'][date_key] = 0
        stats['sessionsByDate'][date_key] += 1
    
    return jsonify(stats)
