from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from utils.role_required import role_required
from utils.whatsapp import send_whatsapp
from bson.objectid import ObjectId
from datetime import datetime

bp = Blueprint('staff', __name__)


@bp.route('/service-tokens', methods=['GET'])
@jwt_required()
@role_required('staff')
def service_tokens():
    claims = get_jwt()
    service = claims.get('service')
    if not service:
        user = current_app.db.users.find_one({'_id': ObjectId(get_jwt_identity())})
        service = user.get('service')

    docs = list(current_app.db.tokens.find({'service': service}).sort('created_at', 1))
    tokens = []
    for d in docs:
        d['_id'] = str(d['_id'])
        d['created_at'] = d['created_at'].isoformat()
        tokens.append(d)
    return jsonify({'service': service, 'tokens': tokens}), 200


@bp.route('/update-status', methods=['PUT'])
@jwt_required()
@role_required('staff')
def update_status():
    data = request.get_json() or {}
    token_id = data.get('token_id')
    new_status = data.get('status')
    if not token_id or not new_status:
        return jsonify({'msg': 'token_id and status are required'}), 400
    if new_status not in ('Waiting', 'In Progress', 'Completed', 'Cancelled', 'Expired'):
        return jsonify({'msg': 'invalid status'}), 400

    claims = get_jwt()
    service = claims.get('service')
    staff_id = get_jwt_identity()
    if not service:
        user = current_app.db.users.find_one({'_id': ObjectId(staff_id)})
        service = user.get('service')

    token = current_app.db.tokens.find_one({'_id': ObjectId(token_id), 'service': service})
    if not token:
        return jsonify({'msg': 'token not found for your service'}), 404

    current_app.db.tokens.update_one({'_id': ObjectId(token_id)}, {'$set': {'status': new_status}})
    updated = current_app.db.tokens.find_one({'_id': ObjectId(token_id)})

    if new_status == 'In Progress':
        # Simulated WhatsApp
        send_whatsapp(updated['student_name'], updated['token_number'], new_status)

    updated['_id'] = str(updated['_id'])
    updated['created_at'] = updated['created_at'].isoformat()
    return jsonify({'token': updated}), 200


@bp.route('/expire-tokens', methods=['PUT'])
@jwt_required()
@role_required('staff')
def expire_tokens():
    claims = get_jwt()
    service = claims.get('service')
    staff_id = get_jwt_identity()
    if not service:
        user = current_app.db.users.find_one({'_id': ObjectId(staff_id)})
        service = user.get('service')

    res = current_app.db.tokens.update_many({'service': service, 'status': 'Waiting'}, {'$set': {'status': 'Expired'}})
    return jsonify({'expired_count': res.modified_count}), 200
