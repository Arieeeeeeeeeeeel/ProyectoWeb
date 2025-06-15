import { Component, OnInit } from '@angular/core';
import { AdminService, Usuario, Producto, Reserva, Stats } from '../../services/admin.service';

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

  constructor(private adminService: AdminService) { }

  ngOnInit() {
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
}
