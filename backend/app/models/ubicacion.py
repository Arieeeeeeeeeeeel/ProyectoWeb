from .. import db

class Direccion(db.Model):
    __tablename__ = 'DIRECCION'
    direccion_id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('USUARIO.personaid'), nullable=False)
    calle = db.Column(db.String(255), nullable=False)
    ciudad = db.Column(db.String(100), nullable=False)
    codigo_postal = db.Column(db.String(20), nullable=False)
    es_principal = db.Column(db.Boolean, default=False)
