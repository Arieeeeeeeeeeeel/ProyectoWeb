from functools import wraps
from flask import request, jsonify, current_app as app
import jwt
from .models.usuario import Usuario

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get('Authorization', None)
        
        if not auth:
            return jsonify({'error': 'Token faltante'}), 401

        parts = auth.split()
        
        if parts[0].lower() != 'bearer' or len(parts) != 2:
            return jsonify({'error': 'Formato de token inválido'}), 401
        
        token = parts[1]
        
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            
            request.user = Usuario.query.get(data['personaid'])  # Puedes usar request.user en la ruta
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expirado'}), 401
        except Exception:
            return jsonify({'error': 'Token inválido'}), 401
        
        return f(*args, **kwargs)
    
    return decorated
