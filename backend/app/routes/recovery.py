from flask import Blueprint, request, jsonify, url_for, current_app
from flask_mail import Message
from .. import mail, db
from ..models.usuario import Usuario
from ..schemas.usuario_schema import StartRecoverySchema, CompleteRecoverySchema
from werkzeug.security import generate_password_hash
import jwt
import datetime

bp = Blueprint('recovery', __name__)

# 1) Enviar email de recuperación
@bp.route('/recovery', methods=['POST'])
def start_recovery():
    data = request.get_json()
    schema = StartRecoverySchema()
    try:
        data = schema.load(data)
    except Exception as err:
        return jsonify(err.messages), 400

    user = Usuario.query.filter_by(correo=data['correo']).first()
    if not user:
        return jsonify({'error': 'Correo no registrado'}), 404

    # Generar token con personaid y expiración (ej. 1 hora)
    payload = {
        'personaid': user.personaid,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }
    token = jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')

    FRONTEND_URL = current_app.config.get('FRONTEND_URL', 'http://localhost:8100')
    recovery_link = (
    f"{FRONTEND_URL}/reset-password?"
    f"id={user.personaid}&token={token}"
    )

    # Enviar correo
    msg = Message(
        subject="Recuperación de contraseña LYL",
        recipients=[user.correo]
    )
    msg.body = (
        f"Hola {user.usuario},\n\n"
        "Has solicitado recuperar tu contraseña. "
        f"Por favor, haz clic en el siguiente enlace para restablecerla (válido 1 hora):\n\n"
        f"{recovery_link}\n\n"
        "Si no solicitaste esto, ignora este correo.\n\n"
        "Saludos,\nEl equipo LYL"
    )
    mail.send(msg)

    return jsonify({'message': 'Email de recuperación enviado'}), 200


# 2) Completar recuperación y cambiar contraseña
@bp.route('/<int:personaid>/recovery', methods=['PUT'])
def complete_recovery(personaid):
    # Obtener token de query string o body
    token = request.args.get('token') or request.json.get('token')
    new_pass = request.json.get('nueva_contrasena')

    if not token or not new_pass:
        return jsonify({'error': 'Token y nueva_contrasena son requeridos'}), 400

    # Validar token
    try:
        data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expirado'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Token inválido'}), 401

    # Verificar que el token corresponda al mismo usuario
    if data.get('personaid') != personaid:
        return jsonify({'error': 'Token no corresponde al usuario'}), 403

    user = Usuario.query.get(personaid)
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    # Actualizar contraseña
    user.contrasena = generate_password_hash(new_pass)
    db.session.commit()

    return jsonify({'message': 'Contraseña restablecida correctamente'}), 200