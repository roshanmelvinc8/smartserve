from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.role_required import role_required
from utils.token_generator import get_next_token
from bson.objectid import ObjectId
from datetime import datetime

bp = Blueprint('student', __name__)


@bp.route('/generate-token', methods=['POST'])
@jwt_required()
@role_required('student')
def generate_token():
    data = request.get_json() or {}
    service = data.get('service')
    if service not in ('Bonafide', 'Transfer', 'Fee'):
        return jsonify({'msg': 'service must be one of Bonafide, Transfer, Fee'}), 400

    student_id = get_jwt_identity()
    student = current_app.db.users.find_one({'_id': ObjectId(student_id)})
    if not student:
        return jsonify({'msg': 'student not found'}), 404

    token_number = get_next_token(current_app.db, service)
    token_doc = {
        'student_id': student_id,
        'student_name': student.get('name'),
        'service': service,
        'token_number': token_number,
        'status': 'Waiting',
        'created_at': datetime.utcnow()
    }
    res = current_app.db.tokens.insert_one(token_doc)
    token_doc['_id'] = str(res.inserted_id)
    token_doc['created_at'] = token_doc['created_at'].isoformat()

    return jsonify({'token': token_doc}), 201


@bp.route('/my-tokens', methods=['GET'])
@jwt_required()
@role_required('student')
def my_tokens():
    student_id = get_jwt_identity()
    docs = list(current_app.db.tokens.find({'student_id': student_id}).sort('created_at', -1))
    tokens = []
    for d in docs:
        d['_id'] = str(d['_id'])
        d['created_at'] = d['created_at'].isoformat()
        tokens.append(d)
    return jsonify({'tokens': tokens}), 200
