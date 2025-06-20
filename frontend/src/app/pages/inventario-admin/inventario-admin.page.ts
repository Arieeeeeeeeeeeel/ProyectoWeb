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

  editarProducto(id: number) {
    this.editandoId = id;
    const producto = this.productosFiltrados.find(p => p.producto_id === id);
    if (producto) {
      producto._modelos = [];
      producto._cargandoModelos = false;
      if (producto.marca) {
        producto._cargandoModelos = true;
        this.vehiculoApi.getModelos(producto.marca).subscribe(res => {
          producto._modelos = res;
          producto._cargandoModelos = false;
        }, () => {
          producto._cargandoModelos = false;
        });
      }
    }
  }

  guardarEdicion(producto: Producto) {
    this.adminService.editarProducto(producto.producto_id, producto).subscribe(() => {
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

  agregarProducto() {
    if (!this.nuevoProducto.nombre || this.nuevoProducto.precio === undefined) return;
    this.adminService.crearProducto(this.nuevoProducto).subscribe(() => {
      this.cargarProductos();
      this.nuevoProducto = { nombre: '', precio: 0, en_oferta: false, mostrar_en_inicio: false };
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
}
