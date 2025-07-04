import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { ProductosService, Producto } from '../../services/productos.service';
import { VehiculoApiService } from '../../services/vehiculo-api.service';

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

  marcas: any[] = [];
  modelos: any[] = [];
  marcaSeleccionada: string = '';
  modeloSeleccionado: string = '';
  cargandoMarcas: boolean = false;
  cargandoProductos: boolean = false;

  productos: Producto[] = [];
  productosOriginal: Producto[] = [];
  currentSort: string = 'nuevo';
  hasSearched: boolean = false;

  constructor(
    private router: Router,
    private cartService: CartService,
    private productosService: ProductosService,
    private vehiculoApi: VehiculoApiService
  ) { }

  ngOnInit() {
    this.getMarcas();
    this.cargarProductos();
  }

  getMarcas() {
    this.cargandoMarcas = true;
    this.vehiculoApi.getMarcas().subscribe({
      next: (marcas) => {
        this.marcas = marcas;
        this.cargandoMarcas = false;
      },
      error: () => {
        this.cargandoMarcas = false;
      }
    });
  }

  onMarcaChange() {
    this.modelos = [];
    this.modeloSeleccionado = '';
    this.searchFilters.marca = this.marcaSeleccionada;
    if (!this.marcaSeleccionada) return;
    this.vehiculoApi.getModelos(this.marcaSeleccionada).subscribe(res => {
      this.modelos = res;
    });
  }

  onModeloChange() {
    this.searchFilters.modelo = this.modeloSeleccionado;
  }

  cargarProductos() {
    this.cargandoProductos = true;
    this.productosService.getProductos().subscribe(productos => {
      this.productosOriginal = productos;
      this.productos = productos;
      this.sortProducts();
      this.cargandoProductos = false;
    }, () => {
      this.cargandoProductos = false;
    });
  }

  buscarProductos() {
    this.hasSearched = true;
    this.cargandoProductos = true;
    const filtros: any = {
      marca: this.searchFilters.marca,
      modelo: this.searchFilters.modelo,
      repuesto: this.searchFilters.repuesto
    };
    if (this.searchFilters.anio !== null && this.searchFilters.anio !== undefined) {
      filtros.ano = this.searchFilters.anio;
    }
    this.productosService.getProductosFiltrados(filtros).subscribe(productos => {
      this.productos = productos;
      this.sortProducts();
      this.cargandoProductos = false;
    }, () => {
      this.cargandoProductos = false;
    });
  }

  aplicarFiltro(tipoFiltro: string) {
    this.currentSort = tipoFiltro;
    this.sortProducts();
  }

  private sortProducts() {
    switch (this.currentSort) {
      case 'nuevo':
        this.productos.sort((a, b) => (b.producto_id || 0) - (a.producto_id || 0));
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
