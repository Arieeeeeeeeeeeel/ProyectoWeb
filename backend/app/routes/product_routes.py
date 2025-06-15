from flask import Blueprint, jsonify
from ..models.producto import Producto


bp = Blueprint('product', __name__)

@bp.route('/products', methods=['GET'])
@bp.route('', methods=['GET'])
def get_products():
    prods = Producto.query.all()
    return jsonify([
        {
            'producto_id': p.producto_id,
            'nombre': p.nombre,
            'descripcion': p.descripcion,
            'marca': p.marca,
            'modelo': p.modelo,
            'ano_compatible': p.ano_compatible,
            'stock': p.stock,
            'precio': float(p.precio),
            'rating': float(p.rating) if p.rating is not None else 0,
            'imagen_url': p.imagen_url,
            'en_oferta': getattr(p, 'en_oferta', False),
            'mostrar_en_inicio': getattr(p, 'mostrar_en_inicio', False)
        }
        for p in prods
    ]), 200

@bp.route('/products/<int:producto_id>', methods=['GET'])
def get_product(producto_id):
    p = Producto.query.get(producto_id)
    if not p:
        return jsonify({'error':'Producto no encontrado'}), 404
    return jsonify({
        'producto_id': p.producto_id,
        'nombre': p.nombre,
        'descripcion': p.descripcion,
        'marca': p.marca,
        'modelo': p.modelo,
        'ano_compatible': p.ano_compatible,
        'stock': p.stock,
        'precio': float(p.precio),
        'rating': float(p.rating),
        'imagen_url': p.imagen_url
    }), 200