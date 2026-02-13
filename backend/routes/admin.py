from flask import Blueprint, jsonify, current_app
from flask_jwt_extended import jwt_required
from utils.role_required import role_required
from datetime import datetime

bp = Blueprint('admin', __name__)


@bp.route('/all-tokens', methods=['GET'])
@jwt_required()
@role_required('admin')
def all_tokens():
    docs = list(current_app.db.tokens.find().sort('created_at', -1))
    tokens = []
    for d in docs:
        d['_id'] = str(d['_id'])
        d['created_at'] = d['created_at'].isoformat()
        tokens.append(d)
    return jsonify({'tokens': tokens}), 200


@bp.route('/analytics', methods=['GET'])
@jwt_required()
@role_required('admin')
def analytics():
    now = datetime.utcnow()
    start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    total_today = current_app.db.tokens.count_documents({'created_at': {'$gte': start}})
    return jsonify({'total_tokens_today': total_today}), 200
