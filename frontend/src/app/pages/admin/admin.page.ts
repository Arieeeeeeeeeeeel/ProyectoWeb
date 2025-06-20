import { Component, OnInit } from '@angular/core';
import { AdminService, Usuario, Producto, Reserva, Stats } from '../../services/admin.service';
import { VehiculoApiService } from '../../services/vehiculo-api.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone:false,
})
export class AdminPage implements OnInit {
  usuarios: Usuario[] = [];
  inventario: Producto[] = [];
  horas: Reserva[] = [];
  totalUsuarios = 0;
  totalProductos = 0;
  totalOfertas = 0;
  totalHoras = 0;
  editandoId: number | null = null;
  productoEditBackup: Producto | null = null;
  marcas: any[] = [];
  modelos: any[] = [];
  cargandoMarcas: boolean = false;
  cargandoModelos: boolean = false;

  constructor(private adminService: AdminService, private vehiculoApi: VehiculoApiService) { }

  ngOnInit() {
    this.getMarcas();
    this.cargarDatos();
  }

  cargarDatos() {
    this.adminService.getUsuarios().subscribe(u => this.usuarios = u);
    this.adminService.getProductos().subscribe(p => this.inventario = p);
    this.adminService.getReservas().subscribe(r => this.horas = r);
    this.adminService.getStats().subscribe(s => {
      this.totalUsuarios = s.total_usuarios;
      this.totalProductos = s.total_productos;
      this.totalOfertas = s.total_ofertas;
      this.totalHoras = s.total_reservas;
    });
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

  onEditMarcaChange(producto: any) {
    this.modelos = [];
    producto.modelo = '';
    this.cargandoModelos = true;
    this.vehiculoApi.getModelos(producto.marca).subscribe(res => {
      this.modelos = res;
      this.cargandoModelos = false;
    }, () => {
      this.cargandoModelos = false;
    });
  }

  onEditModeloChange(producto: any) {
    // El modelo ya se actualiza por ngModel
  }

  toggleOferta(producto: Producto) {
    this.adminService.editarProducto(producto.producto_id, { en_oferta: !producto.en_oferta }).subscribe(() => this.cargarDatos());
  }

  eliminarUsuario(usuario: Usuario) {
    this.adminService.eliminarUsuario(usuario.id).subscribe(() => this.cargarDatos());
  }

  eliminarProducto(producto: Producto) {
    this.adminService.eliminarProducto(producto.producto_id).subscribe(() => this.cargarDatos());
  }

  eliminarHora(hora: Reserva) {
    this.adminService.eliminarReserva(hora.id).subscribe(() => this.cargarDatos());
  }

  toggleMostrarEnInicio(producto: Producto) {
    this.adminService.editarProducto(producto.producto_id, { mostrar_en_inicio: !producto.mostrar_en_inicio }).subscribe(() => this.cargarDatos());
  }

  editarProducto(producto: Producto) {
    this.editandoId = producto.producto_id;
    // Hacemos una copia para poder cancelar
    this.productoEditBackup = { ...producto };
  }

  guardarEdicion(producto: Producto) {
    this.adminService.editarProducto(producto.producto_id, producto).subscribe(() => {
      this.editandoId = null;
      this.productoEditBackup = null;
      this.cargarDatos();
    });
  }

  cancelarEdicion(producto: Producto) {
    if (this.productoEditBackup) {
      Object.assign(producto, this.productoEditBackup);
    }
    this.editandoId = null;
    this.productoEditBackup = null;
  }
}
