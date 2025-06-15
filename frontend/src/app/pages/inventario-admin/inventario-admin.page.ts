import { Component, OnInit } from '@angular/core';
import { AdminService, Producto } from '../../services/admin.service';

@Component({
  selector: 'app-inventario-admin',
  templateUrl: './inventario-admin.page.html',
  styleUrls: ['./inventario-admin.page.scss'],
  standalone:false,
})
export class InventarioAdminPage implements OnInit {
  productos: Producto[] = [];
  editandoId: number | null = null;
  nuevoProducto: Partial<Producto> = {
    nombre: '',
    precio: 0,
    en_oferta: false,
    mostrar_en_inicio: false
  };
  nuevaEtiqueta: string = '';

  constructor(private adminService: AdminService) { }

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.adminService.getProductos().subscribe(p => this.productos = p);
  }

  editarProducto(id: number) {
    this.editandoId = id;
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
    this.adminService.editarProducto(producto.producto_id, { en_oferta: !producto.en_oferta }).subscribe(() => this.cargarProductos());
  }

  toggleMostrarEnInicio(producto: Producto) {
    this.adminService.editarProducto(producto.producto_id, { mostrar_en_inicio: !producto.mostrar_en_inicio }).subscribe(() => this.cargarProductos());
  }
}
