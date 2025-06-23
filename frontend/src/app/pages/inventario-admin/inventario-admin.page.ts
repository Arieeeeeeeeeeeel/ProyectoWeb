import { Component, OnInit } from '@angular/core';
import { AdminService, Producto } from '../../services/admin.service';
import { VehiculoApiService } from '../../services/vehiculo-api.service';

interface ProductoEditable extends Producto {
  _modelos?: any[];
  _cargandoModelos?: boolean;
}

@Component({
  selector: 'app-inventario-admin',
  templateUrl: './inventario-admin.page.html',
  styleUrls: ['./inventario-admin.page.scss'],
  standalone:false,
})
export class InventarioAdminPage implements OnInit {
  productos: Producto[] = [];
  productosFiltrados: ProductoEditable[] = [];
  filtroBusqueda: string = '';
  filtroMarca: string = '';
  filtroOferta: boolean = false;
  marcasUnicas: string[] = [];
  editandoId: number | null = null;
  nuevoProducto: Partial<Producto> = {
    nombre: '',
    precio: 0,
    en_oferta: false,
    mostrar_en_inicio: false
  };
  nuevaEtiqueta: string = '';
  loadingOferta: number | null = null;
  loadingInicio: number | null = null;

  marcas: any[] = [];
  modelos: any[] = [];
  marcaSeleccionada: string = '';
  modeloSeleccionado: string = '';
  cargandoMarcas: boolean = false;
  cargandoModelos: boolean = false;

  nuevoProductoCompat: any = { marca_auto: '', modelo_auto: '', ano_desde: null, ano_hasta: null };
  compatibilidades: any[] = [];
  editarCompatibilidades: any[] = [];

  // Propiedades para compatibilidad (independientes de los campos de producto)
  marcaCompatSeleccionada: string = '';
  modeloCompatSeleccionado: string = '';
  modelosCompat: any[] = [];
  cargandoModelosCompat: boolean = false;

  constructor(private adminService: AdminService, private vehiculoApi: VehiculoApiService) { }

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
    this.nuevoProducto.marca = this.marcaSeleccionada;
    if (!this.marcaSeleccionada) return;
    this.cargandoModelos = true;
    this.vehiculoApi.getModelos(this.marcaSeleccionada).subscribe(res => {
      this.modelos = res;
      this.cargandoModelos = false;
    });
  }

  onModeloChange() {
    this.nuevoProducto.modelo = this.modeloSeleccionado;
  }

  cargarProductos() {
    this.adminService.getProductos().subscribe(p => {
      this.productos = p;
      this.marcasUnicas = Array.from(new Set(p.map(prod => prod.marca).filter((m): m is string => !!m)));
      this.aplicarFiltro();
    });
  }

  aplicarFiltro() {
    this.productosFiltrados = this.productos.filter(prod => {
      const texto = (this.filtroBusqueda || '').toLowerCase();
      const coincideBusqueda =
        prod.nombre.toLowerCase().includes(texto) ||
        (prod.modelo && prod.modelo.toLowerCase().includes(texto));
      const coincideMarca = !this.filtroMarca || prod.marca === this.filtroMarca;
      const coincideOferta = !this.filtroOferta || prod.en_oferta;
      return coincideBusqueda && coincideMarca && coincideOferta;
    });
  }

  editarProducto(producto: Producto) {
    this.editandoId = producto.producto_id;
    const prod = this.productosFiltrados.find(p => p.producto_id === producto.producto_id);
    if (prod) {
      prod._modelos = [];
      prod._cargandoModelos = false;
      if (prod.marca) {
        prod._cargandoModelos = true;
        this.vehiculoApi.getModelos(prod.marca).subscribe(res => {
          prod._modelos = res;
          prod._cargandoModelos = false;
        }, () => {
          prod._cargandoModelos = false;
        });
      }
      // Cargar compatibilidades del producto (debería venir del backend, aquí simulado)
      this.editarCompatibilidades = (prod as any).compatibilidad ? [...(prod as any).compatibilidad] : [];
    }
  }

  agregarCompatibilidad() {
    if (this.nuevoProductoCompat.marca_auto && this.nuevoProductoCompat.modelo_auto && this.nuevoProductoCompat.ano_desde) {
      this.compatibilidades.push({ ...this.nuevoProductoCompat });
      this.nuevoProductoCompat = { marca_auto: '', modelo_auto: '', ano_desde: null, ano_hasta: null };
    }
  }
  eliminarCompatibilidad(idx: number) {
    this.compatibilidades.splice(idx, 1);
  }

  agregarProducto() {
    if (!this.nuevoProducto.nombre || this.nuevoProducto.precio === undefined) return;
    this.adminService.crearProductoConCompatibilidad(this.nuevoProducto, this.compatibilidades).subscribe(() => {
      this.cargarProductos();
      this.nuevoProducto = { nombre: '', precio: 0, en_oferta: false, mostrar_en_inicio: false };
      this.compatibilidades = [];
    });
  }

  toggleOferta(producto: Producto) {
    this.loadingOferta = producto.producto_id;
    this.adminService.editarProducto(producto.producto_id, { en_oferta: !producto.en_oferta }).subscribe({
      next: () => {
        this.cargarProductos();
        this.loadingOferta = null;
      },
      error: () => {
        this.loadingOferta = null;
      }
    });
  }

  toggleMostrarEnInicio(producto: Producto) {
    this.loadingInicio = producto.producto_id;
    this.adminService.editarProducto(producto.producto_id, { mostrar_en_inicio: !producto.mostrar_en_inicio }).subscribe({
      next: () => {
        this.cargarProductos();
        this.loadingInicio = null;
      },
      error: () => {
        this.loadingInicio = null;
      }
    });
  }

  onEditMarcaChange(producto: ProductoEditable) {
    producto._modelos = [];
    producto.modelo = '';
    producto._cargandoModelos = true;
    this.vehiculoApi.getModelos(producto.marca!).subscribe(res => {
      producto._modelos = res;
      producto._cargandoModelos = false;
    }, () => {
      producto._cargandoModelos = false;
    });
  }

  onEditModeloChange(producto: ProductoEditable) {
    // El modelo ya se actualiza por ngModel
  }

  agregarCompatibilidadEdicion() {
    if (this.nuevoProductoCompat.marca_auto && this.nuevoProductoCompat.modelo_auto && this.nuevoProductoCompat.ano_desde) {
      this.editarCompatibilidades.push({ ...this.nuevoProductoCompat });
      this.nuevoProductoCompat = { marca_auto: '', modelo_auto: '', ano_desde: null, ano_hasta: null };
    }
  }
  eliminarCompatibilidadEdicion(idx: number) {
    this.editarCompatibilidades.splice(idx, 1);
  }
  guardarEdicion(producto: Producto) {
    this.adminService.editarProductoConCompatibilidad(producto.producto_id, producto, this.editarCompatibilidades).subscribe(() => {
      this.editandoId = null;
      this.cargarProductos();
    });
  }

  cancelarEdicion() {
    this.cargarProductos();
    this.editandoId = null;
  }

  eliminarProducto(id: number) {
    this.adminService.eliminarProducto(id).subscribe(() => this.cargarProductos());
  }

  onMarcaCompatChange() {
    this.modelosCompat = [];
    this.modeloCompatSeleccionado = '';
    if (!this.marcaCompatSeleccionada) return;
    this.cargandoModelosCompat = true;
    this.vehiculoApi.getModelos(this.marcaCompatSeleccionada).subscribe(res => {
      this.modelosCompat = res;
      this.cargandoModelosCompat = false;
    }, () => {
      this.cargandoModelosCompat = false;
    });
  }

  onModeloCompatChange() {
    // El modelo de compatibilidad ya se actualiza por ngModel
  }
}
