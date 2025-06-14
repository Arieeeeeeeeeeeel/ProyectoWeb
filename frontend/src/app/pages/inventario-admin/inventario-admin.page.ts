import { Component, OnInit } from '@angular/core';

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  etiquetas: string[];
  enOferta: boolean;
  mostrarEnInicio: boolean;
}

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
    etiquetas: [],
    enOferta: false,
    mostrarEnInicio: false
  };
  nuevaEtiqueta: string = '';

  constructor() { }

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    // Simula obtener productos del backend/localStorage
    const guardados = localStorage.getItem('inventario_admin_productos');
    if (guardados) {
      this.productos = JSON.parse(guardados);
    } else {
      // Mock inicial
      this.productos = [
        { id: 1, nombre: 'Aceite 20W-50', precio: 4500, etiquetas: ['aceite', 'motor', 'toyota'], enOferta: false, mostrarEnInicio: true },
        { id: 2, nombre: 'Filtro de Aire', precio: 12000, etiquetas: ['filtro', 'aire', 'hilux'], enOferta: true, mostrarEnInicio: false },
      ];
      this.guardarProductos();
    }
  }

  guardarProductos() {
    localStorage.setItem('inventario_admin_productos', JSON.stringify(this.productos));
  }

  editarProducto(id: number) {
    this.editandoId = id;
  }

  guardarEdicion(producto: Producto) {
    this.editandoId = null;
    this.guardarProductos();
  }

  cancelarEdicion() {
    this.cargarProductos();
    this.editandoId = null;
  }

  eliminarProducto(id: number) {
    this.productos = this.productos.filter(p => p.id !== id);
    this.guardarProductos();
  }

  agregarEtiqueta(producto: Producto, etiqueta: string) {
    if (etiqueta && !producto.etiquetas.includes(etiqueta)) {
      producto.etiquetas.push(etiqueta);
      this.guardarProductos();
    }
  }

  eliminarEtiqueta(producto: Producto, etiqueta: string) {
    producto.etiquetas = producto.etiquetas.filter(e => e !== etiqueta);
    this.guardarProductos();
  }

  agregarProducto() {
    if (!this.nuevoProducto.nombre || this.nuevoProducto.precio === undefined) return;
    const nuevo: Producto = {
      id: Date.now(),
      nombre: this.nuevoProducto.nombre!,
      precio: this.nuevoProducto.precio!,
      etiquetas: this.nuevoProducto.etiquetas || [],
      enOferta: !!this.nuevoProducto.enOferta,
      mostrarEnInicio: !!this.nuevoProducto.mostrarEnInicio
    };
    this.productos.push(nuevo);
    this.guardarProductos();
    this.nuevoProducto = { nombre: '', precio: 0, etiquetas: [], enOferta: false, mostrarEnInicio: false };
  }

  // Cambios de checks
  toggleOferta(producto: Producto) {
    producto.enOferta = !producto.enOferta;
    this.guardarProductos();
  }

  toggleMostrarEnInicio(producto: Producto) {
    producto.mostrarEnInicio = !producto.mostrarEnInicio;
    this.guardarProductos();
  }
}
