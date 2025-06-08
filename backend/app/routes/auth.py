from flask import Blueprint, request, jsonify

from marshmallow import ValidationError
from ..models.usuario import Usuario
from ..schemas.login_schema import LoginSchema
from ..schemas.usuario_schema import UsuarioSchema
from werkzeug.security import check_password_hash, generate_password_hash
import jwt
import datetime
from app.config.config import Config
from app.utils import token_required
from flask_cors import cross_origin
from .. import db

bp = Blueprint('auth', __name__)

@bp.route('/signup', methods=['POST'])
@cross_origin(origin="http://localhost:8100")
def signup():
    data = request.get_json()

    user_schema = UsuarioSchema()
    try:
        user_data = user_schema.load(data) 
    except ValidationError as err:
        return jsonify(err.messages), 400
    
    if Usuario.query.filter_by(rut=user_data.rut).first() or Usuario.query.filter_by(correo=user_data.correo).first():
        return jsonify({'error': 'Usuario ya existe'}), 400
    user = Usuario(
        rut=user_data.rut,
        usuario=user_data.usuario,
        correo=user_data.correo,
        contrasena=generate_password_hash(user_data.contrasena),
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
@cross_origin(origin="http://localhost:8100")
def login():
    login_schema = LoginSchema()

    try:
        data = login_schema.load(request.get_json())  
    except Exception as e:
        return jsonify({'error': 'Datos inválidos', 'message': str(e)}), 400

    correo = data['correo']
    contrasena = data['contrasena']

    user = Usuario.query.filter_by(correo=correo).first()
    if not user or not check_password_hash(user.contrasena, contrasena):
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

@bp.route('/<personaid>/signout', methods=['POST'])
@cross_origin(origin="http://localhost:8100")
@token_required
def signout(personaid):
    return jsonify({'message':f'Usuario {personaid} ha cerrado sesión'}), 200