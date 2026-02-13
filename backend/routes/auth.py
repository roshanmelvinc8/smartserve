from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token

bp = Blueprint('auth', __name__)


@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'msg': 'email and password required'}), 400

    user = current_app.db.users.find_one({'email': email, 'password': password})
    if not user:
        return jsonify({'msg': 'invalid credentials'}), 401

    access_token = create_access_token(
        identity=str(user['_id']),
        additional_claims={'role': user['role'], 'service': user.get('service')}
    )

    return jsonify({
        'access_token': access_token,
        'user': {
            '_id': str(user['_id']),
            'name': user.get('name'),
            'email': user.get('email'),
            'role': user.get('role'),
            'service': user.get('service')
        }
    }), 200
