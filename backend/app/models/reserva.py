from .. import db

class Reserva(db.Model):
    __tablename__ = 'RESERVA'
    reserva_id    = db.Column(db.Integer, primary_key=True)
    fecha_reserva = db.Column(db.DateTime, nullable=False)
    ubicacion     = db.Column(db.String(255), nullable=False)
    notas         = db.Column(db.Text)
    usuario_id    = db.Column(db.Integer, db.ForeignKey('USUARIO.personaid'), nullable=False)
    vehiculo_id   = db.Column(db.Integer, db.ForeignKey('VEHICULO.vehiculo_id'), nullable=False)
    servicio_id   = db.Column(db.Integer, db.ForeignKey('SERVICIO.servicio_id'), nullable=False)
    nombre_completo = db.Column(db.String(255), nullable=False)
    color = db.Column(db.String(30))  # Nuevo campo para color solicitado