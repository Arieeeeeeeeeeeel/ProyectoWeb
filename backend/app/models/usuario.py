from .. import db
from werkzeug.security import generate_password_hash, check_password_hash
import datetime


class Usuario(db.Model):
    __tablename__ = 'USUARIO'
    personaid      = db.Column(db.Integer, primary_key=True)
    rut            = db.Column(db.String(20), unique=True, nullable=False)
    usuario        = db.Column(db.String(100), nullable=False)
    correo         = db.Column(db.String(150), unique=True, nullable=False)
    contrasena     = db.Column(db.String(255), nullable=False)
    region         = db.Column(db.String(100), nullable=False)
    comuna         = db.Column(db.String(100), nullable=False)
    telefono       = db.Column(db.String(20), nullable=True)  # <--- NUEVO CAMPO
    fecha_registro = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    ultimo_token_recuperacion = db.Column(db.String(512), nullable=True)  # <--- NUEVO CAMPO
    vehiculos      = db.relationship('Vehiculo', backref='usuario', lazy=True)
    compras        = db.relationship('Compra', backref='usuario', lazy=True)
    reservas       = db.relationship('Reserva', backref='usuario', lazy=True)
    direcciones    = db.relationship('Direccion', backref='usuario', lazy=True)
