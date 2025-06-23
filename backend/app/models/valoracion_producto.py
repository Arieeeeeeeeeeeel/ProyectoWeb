from .. import db

class ValoracionProducto(db.Model):
    __tablename__ = 'VALORACION_PRODUCTO'
    id = db.Column(db.Integer, primary_key=True)
    producto_id = db.Column(db.Integer, db.ForeignKey('PRODUCTO.producto_id'), nullable=False)
    usuario_id = db.Column(db.Integer, db.ForeignKey('USUARIO.personaid'), nullable=False)
    rating = db.Column(db.Numeric(3,2), nullable=False)
    __table_args__ = (db.UniqueConstraint('producto_id', 'usuario_id', name='uq_producto_usuario'),)
