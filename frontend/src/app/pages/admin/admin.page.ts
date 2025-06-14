import { Component, OnInit } from '@angular/core';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

interface Producto {
  id: number;
  nombre: string;
  stock: number;
  precio: number;
  enOferta: boolean;
}

interface HoraAgendada {
  id: number;
  cliente: string;
  fecha: string;
  prioridad: number;
  detalle: string;
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone:false,
})
export class AdminPage implements OnInit {

  usuarios: Usuario[] = [];
  inventario: Producto[] = [];
  horas: HoraAgendada[] = [];

  // Estadísticas rápidas
  totalUsuarios: number = 0;
  totalProductos: number = 0;
  totalOfertas: number = 0;
  totalHoras: number = 0;

  constructor() { }

  ngOnInit() {
    this.loadFromLocalStorage();
    if (this.usuarios.length === 0 && this.inventario.length === 0 && this.horas.length === 0) {
      // MOCK: Simula datos del backend solo si no hay datos guardados
      this.usuarios = [
        { id: 1, nombre: 'Juan Pérez', email: 'juan@mail.com', rol: 'cliente' },
        { id: 2, nombre: 'Ana Admin', email: 'admin@admin.com', rol: 'admin' },
        // ...otros usuarios...
      ];
      this.inventario = [
        { id: 1, nombre: 'Producto A', stock: 10, precio: 10000, enOferta: false },
        { id: 2, nombre: 'Producto B', stock: 5, precio: 15000, enOferta: true },
        // ...otros productos...
      ];
      this.horas = [
        { id: 1, cliente: 'Juan Pérez', fecha: '2024-06-10 10:00', prioridad: 2, detalle: 'Consulta' },
        { id: 2, cliente: 'Ana Admin', fecha: '2024-06-10 09:00', prioridad: 1, detalle: 'Revisión' },
        // ...otras horas...
      ];
      this.saveToLocalStorage();
    }
    this.horas.sort((a, b) => a.prioridad - b.prioridad);
    this.updateStats();
  }

  toggleOferta(producto: Producto) {
    producto.enOferta = !producto.enOferta;
    this.saveToLocalStorage();
    this.updateStats();
  }

  eliminarUsuario(usuario: Usuario) {
    this.usuarios = this.usuarios.filter(u => u.id !== usuario.id);
    this.saveToLocalStorage();
    this.updateStats();
  }

  eliminarProducto(producto: Producto) {
    this.inventario = this.inventario.filter(p => p.id !== producto.id);
    this.saveToLocalStorage();
    this.updateStats();
  }

  eliminarHora(hora: HoraAgendada) {
    this.horas = this.horas.filter(h => h.id !== hora.id);
    this.saveToLocalStorage();
    this.updateStats();
  }

  updateStats() {
    this.totalUsuarios = this.usuarios.length;
    this.totalProductos = this.inventario.length;
    this.totalOfertas = this.inventario.filter(p => p.enOferta).length;
    this.totalHoras = this.horas.length;
  }

  saveToLocalStorage() {
    localStorage.setItem('admin_usuarios', JSON.stringify(this.usuarios));
    localStorage.setItem('admin_inventario', JSON.stringify(this.inventario));
    localStorage.setItem('admin_horas', JSON.stringify(this.horas));
  }

  loadFromLocalStorage() {
    const usuarios = localStorage.getItem('admin_usuarios');
    const inventario = localStorage.getItem('admin_inventario');
    const horas = localStorage.getItem('admin_horas');
    this.usuarios = usuarios ? JSON.parse(usuarios) : [];
    this.inventario = inventario ? JSON.parse(inventario) : [];
    this.horas = horas ? JSON.parse(horas) : [];
  }
}
