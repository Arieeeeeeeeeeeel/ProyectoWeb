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
    this.productos = this.productosOriginal.filter(producto => {
      const marcaOk = !this.searchFilters.marca || (producto.marca || '').toLowerCase().includes(this.searchFilters.marca.toLowerCase());
      const modeloOk = !this.searchFilters.modelo || (producto.modelo || '').toLowerCase().includes(this.searchFilters.modelo.toLowerCase());
      // Compatibilidad: si no hay filtro, ok; si hay filtro, buscar en compatibilidad
      let compatible = false;
      if (this.searchFilters.marca || this.searchFilters.modelo) {
        compatible = (producto.compatibilidad || []).some(c => {
          const marcaMatch = !this.searchFilters.marca || (c.marca_auto || '').toLowerCase().includes(this.searchFilters.marca.toLowerCase());
          const modeloMatch = !this.searchFilters.modelo || (c.modelo_auto || '').toLowerCase().includes(this.searchFilters.modelo.toLowerCase());
          return marcaMatch && modeloMatch;
        });
      }
      const anioOk = true;
      const repuestoOk = !this.searchFilters.repuesto || (producto.descripcion || '').toLowerCase().includes(this.searchFilters.repuesto.toLowerCase());
      // Mostrar si coincide por marca/modelo directo o por compatibilidad
      return (marcaOk && modeloOk && anioOk && repuestoOk) || (compatible && repuestoOk);
    });
    this.sortProducts();
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
