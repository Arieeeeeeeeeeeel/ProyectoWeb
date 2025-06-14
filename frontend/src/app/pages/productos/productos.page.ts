import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { ProductosService, Producto } from '../../services/productos.service';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
  standalone: false,
})
export class ProductosPage implements OnInit {
  searchFilters = {
    marca: '',
    modelo: '',
    anio: null as number | null,
    repuesto: ''
  };

  productos: Producto[] = [];
  currentSort: string = 'nuevo';
  hasSearched: boolean = false;

  constructor(
    private router: Router,
    private cartService: CartService,
    private productosService: ProductosService
  ) { }

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.productosService.getProductos().subscribe(productos => {
      this.productos = productos;
      this.sortProducts();
    });
  }

  buscarProductos() {
    this.hasSearched = true;
    this.cargarProductos();
  }

  aplicarFiltro(tipoFiltro: string) {
    this.currentSort = tipoFiltro;
    this.sortProducts();
  }

  private sortProducts() {
    switch (this.currentSort) {
      case 'nuevo':
        break;
      case 'precioAsc':
        this.productos.sort((a, b) => (a.precio || 0) - (b.precio || 0));
        break;
      case 'precioDesc':
        this.productos.sort((a, b) => (b.precio || 0) - (a.precio || 0));
        break;
      case 'valoracion':
        this.productos.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }
  }

  verDetalleProducto(id: number) {
    this.router.navigate(['/producto-detalle', id]);
  }

  agregarAlCarrito(producto: Producto, cantidad: number = 1) {
    this.cartService.addItem({
      productoId: producto.producto_id.toString(),
      nombre: producto.nombre,
      imagen: producto.imagen_url,
      precio: producto.precio,
      stock: producto.stock
    }, cantidad);
  }

  trackByProductoId(index: number, producto: Producto): number {
    return producto.producto_id;
  }
}
