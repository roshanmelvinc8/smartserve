from functools import wraps
from flask_jwt_extended import get_jwt
from flask import jsonify


def role_required(role):
    """Decorator — requires JWT and checks `role` claim."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            claims = get_jwt()
            if not claims or claims.get('role') != role:
                return jsonify({'msg': f'forbidden - requires {role} role'}), 403
            return fn(*args, **kwargs)

        return wrapper

    return decorator
