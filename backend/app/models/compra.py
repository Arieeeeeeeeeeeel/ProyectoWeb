from .. import db
import datetime

class Compra(db.Model):
    __tablename__ = 'COMPRA'
    compra_id           = db.Column(db.Integer, primary_key=True)
    fecha_compra        = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    total               = db.Column(db.Numeric(10,2), nullable=False)
    estado_pago         = db.Column(db.String(50), nullable=False)
    usuario_id          = db.Column(db.Integer, db.ForeignKey('USUARIO.personaid'), nullable=False)
    direccion_envio     = db.Column(db.String(255))  # Nuevo campo para dirección de despacho
    detalles            = db.relationship('DetalleCompra', backref='compra', lazy=True, cascade='all, delete-orphan')