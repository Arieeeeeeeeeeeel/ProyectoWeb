from .. import db
import datetime

class Compra(db.Model):
    __tablename__ = 'COMPRA'
    compra_id           = db.Column(db.Integer, primary_key=True)
    fecha_compra        = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    fecha_entrega_estim = db.Column(db.DateTime)
    total               = db.Column(db.Numeric(10,2), nullable=False)
    estado_pago         = db.Column(db.String(50), nullable=False)
    usuario_rut         = db.Column(db.String(20), db.ForeignKey('USUARIO.rut'), nullable=False)
    detalles            = db.relationship('DetalleCompra', backref='compra', lazy=True, cascade='all, delete-orphan')