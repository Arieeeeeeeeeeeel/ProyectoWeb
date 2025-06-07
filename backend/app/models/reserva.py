from .. import db

class Reserva(db.Model):
    __tablename__ = 'RESERVA'
    reserva_id    = db.Column(db.Integer, primary_key=True)
    fecha_reserva = db.Column(db.DateTime, nullable=False)
    estado        = db.Column(db.String(50), nullable=False)
    ubicacion     = db.Column(db.String(255), nullable=False)
    notas         = db.Column(db.Text)
    usuario_rut   = db.Column(db.String(20), db.ForeignKey('USUARIO.rut'), nullable=False)
    vehiculo_id   = db.Column(db.Integer, db.ForeignKey('VEHICULO.vehiculo_id'), nullable=False)
    servicio_id   = db.Column(db.Integer, db.ForeignKey('SERVICIO.servicio_id'), nullable=False)