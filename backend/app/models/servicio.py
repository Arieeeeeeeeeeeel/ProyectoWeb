from .. import db

class Servicio(db.Model):
    __tablename__ = 'SERVICIO'
    servicio_id       = db.Column(db.Integer, primary_key=True)
    nombre            = db.Column(db.String(100), nullable=False)
    descripcion       = db.Column(db.Text)
    precio            = db.Column(db.Numeric(10,2), nullable=False)
    duracion_estimada = db.Column(db.Integer)
    a_domicilio       = db.Column(db.Boolean, default=False)
    reservas          = db.relationship('Reserva', backref='servicio', lazy=True)
    ofertas           = db.relationship('Oferta', backref='servicio', lazy=True)