from .. import db

class Vehiculo(db.Model):
    __tablename__ = 'VEHICULO'
    vehiculo_id      = db.Column(db.Integer, primary_key=True)
    marca            = db.Column(db.String(50), nullable=False)
    modelo           = db.Column(db.String(50), nullable=False)
    ano              = db.Column(db.Integer, nullable=False)
    patente          = db.Column(db.String(20), nullable=False)
    tipo_combustible = db.Column(db.String(50), nullable=False)
    color            = db.Column(db.String(30), nullable=False)
    apodo            = db.Column(db.String(50))
    usuario_rut      = db.Column(db.String(20), db.ForeignKey('USUARIO.rut'), nullable=False)
    reservas         = db.relationship('Reserva', backref='vehiculo', lazy=True)
