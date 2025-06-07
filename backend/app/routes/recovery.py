from flask import Blueprint, request, jsonify
from flask_mail import Message
from .. import mail, db
from app.config.config import Config
from ..models.usuario import Usuario
from ..schemas.usuario_schema import StartRecoverySchema, CompleteRecoverySchema
from werkzeug.security import generate_password_hash
import jwt
import datetime

bp = Blueprint('recovery', __name__)

def send_recovery_email(user, recovery_token):
    msg = Message(
        subject="Recuperación de Contraseña",
        sender=Config.MAIL_DEFAULT_SENDER,
        recipients=[user.correo],
        body=f"Para recuperar tu contraseña, usa el siguiente token: {recovery_token}\n"
             f"Este token expirará en 1 hora."
    )
    try:
        mail.send(msg)
    except Exception as e:
        print(f"Error al enviar el correo: {str(e)}")
        return False
    return True


@bp.route('/recovery', methods=['POST'])
def start_recovery():
    schema = StartRecoverySchema()
    data = request.get_json()

    try:
        schema.load(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
    correo = data.get('correo')
    user = Usuario.query.filter_by(correo=correo).first()
    if not user:
        return jsonify({'error':'Usuario no encontrado'}), 404
    
    recovery_token = jwt.encode(
        {'personaid': user.personaid, 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)},
        Config.SECRET_KEY,
        algorithm='HS256'
    )

    if not send_recovery_email(user, recovery_token):
        return jsonify({'error': 'Error al enviar el correo'}), 500
    
    return jsonify({'message': 'Recovery token enviado', 'token': recovery_token}), 200

@bp.route('/<personaid>/recovery', methods=['PUT'])
def complete_recovery(personaid):
    schema = CompleteRecoverySchema()
    data = request.get_json()

    try: 
        schema.load(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

    try:
        # Decodificar el token JWT
        token_data = jwt.decode(data['token'], Config.SECRET_KEY, algorithms=['HS256'])
        
        if token_data['personaid'] != int(personaid):
            return jsonify({'error': 'Token inválido para este usuario'}), 400
        
        # Cambiar la contraseña del usuario
        user = Usuario.query.get(personaid)
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        # Actualizar la contraseña con la nueva contraseña (encriptada)
        user.contrasena = generate_password_hash(data['nueva_contrasena'])
        db.session.commit()
        
        return jsonify({'message': f'Contraseña actualizada para {personaid}'}), 200
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expirado'}), 400
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Token inválido'}), 400