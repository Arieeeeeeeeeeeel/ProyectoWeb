from .. import db

class DetalleCompra(db.Model):
    __tablename__ = 'DETALLE_COMPRA'
    compra_id       = db.Column(db.Integer, db.ForeignKey('COMPRA.compra_id'), primary_key=True)
    producto_id     = db.Column(db.Integer, db.ForeignKey('PRODUCTO.producto_id'), primary_key=True)
    cantidad        = db.Column(db.Integer, nullable=False)
    precio_unitario = db.Column(db.Numeric(10,2), nullable=False)