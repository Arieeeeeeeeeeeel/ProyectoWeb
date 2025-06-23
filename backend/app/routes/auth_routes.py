from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from ..models.usuario import Usuario
from ..schemas.login_schema import LoginSchema
from ..schemas.usuario_schema import UsuarioSchema
import bcrypt
import jwt
import datetime
from app.config.config import Config
from app.utils import token_required
from .. import db

bp = Blueprint('auth', __name__)

@bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()

    user_schema = UsuarioSchema()
    try:
        user_data = user_schema.load(data) 
    except ValidationError as err:
        return jsonify(err.messages), 400
    
    if Usuario.query.filter_by(rut=user_data.rut).first() or Usuario.query.filter_by(correo=user_data.correo).first():
        return jsonify({'error': 'Usuario ya existe'}), 400
    hashed_pw = bcrypt.hashpw(user_data.contrasena.encode('utf-8'), bcrypt.gensalt())
    user = Usuario(
        rut=user_data.rut,
        usuario=user_data.usuario,
        correo=user_data.correo,
        contrasena=hashed_pw.decode('utf-8'),
        region=user_data.region,
        comuna=user_data.comuna
    )
    db.session.add(user)
    db.session.commit()
    token = jwt.encode(
        {
            'personaid': user.personaid,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        },
        Config.SECRET_KEY,
        algorithm='HS256'
    )
    result = user_schema.dump(user)
    return jsonify({
        'token': token,
        'user': result
    }), 201

@bp.route('/login', methods=['POST'])
def login():
    login_schema = LoginSchema()

    try:
        data = login_schema.load(request.get_json())  
    except Exception as e:
        return jsonify({'error': 'Datos inválidos', 'message': str(e)}), 400

    correo = data['correo']
    contrasena = data['contrasena']

    user = Usuario.query.filter_by(correo=correo).first()
    if not user or not bcrypt.checkpw(contrasena.encode('utf-8'), user.contrasena.encode('utf-8')):
        return jsonify({'error': 'Credenciales inválidas'}), 401

    token = jwt.encode(
        {'personaid': user.personaid, 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)},
        Config.SECRET_KEY,  
        algorithm='HS256'
    )

    user_schema = UsuarioSchema()
    user_data = user_schema.dump(user)
    return jsonify({
        'token': token,
        'user': user_data
    }), 200

@bp.route('/change_password', methods=['POST'])
@token_required
def change_password(current_user):
    data = request.get_json()
    old_password = data.get('old_password')
    new_password = data.get('new_password')
    if not old_password or not new_password:
        return jsonify({'error': 'Faltan datos'}), 400
    user = current_user
    if not bcrypt.checkpw(old_password.encode('utf-8'), user.contrasena.encode('utf-8')):
        return jsonify({'error': 'La contraseña actual es incorrecta'}), 400
    user.contrasena = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    db.session.commit()
    return jsonify({'message': 'Contraseña actualizada correctamente'}), 200