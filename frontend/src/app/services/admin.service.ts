import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
}

export interface Producto {
  producto_id: number;
  nombre: string;
  descripcion?: string;
  marca?: string;
  modelo?: string;
  ano_compatible?: number;
  stock: number;
  precio: number;
  rating?: number;
  imagen_url?: string;
  en_oferta: boolean;
  mostrar_en_inicio: boolean;
}

export interface Reserva {
  id: number;
  cliente: string;
  fecha: string;
  estado: string;
  detalle: string;
}

export interface Stats {
  total_usuarios: number;
  total_productos: number;
  total_ofertas: number;
  total_reservas: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private API_URL = 'https://3aeb-190-8-112-252.ngrok-free.app'; // Cambiado para usar la raíz de la API

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'ngrok-skip-browser-warning': 'true'
    });
  }

  // Usuarios
  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.API_URL}/admin/usuarios`, { headers: this.getAuthHeaders() });
  }
  eliminarUsuario(id: number) {
    return this.http.delete(`${this.API_URL}/admin/usuarios/${id}`, { headers: this.getAuthHeaders() });
  }

  // Productos
  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.API_URL}/products`, { headers: this.getAuthHeaders() });
  }
  crearProducto(producto: Partial<Producto>) {
    return this.http.post(`${this.API_URL}/products`, producto, { headers: this.getAuthHeaders() });
  }
  editarProducto(id: number, producto: Partial<Producto>) {
    return this.http.put(`${this.API_URL}/products/${id}`, producto, { headers: this.getAuthHeaders() });
  }
  eliminarProducto(id: number) {
    return this.http.delete(`${this.API_URL}/products/${id}`, { headers: this.getAuthHeaders() });
  }

  // Reservas
  getReservas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.API_URL}/admin/reservas`, { headers: this.getAuthHeaders() });
  }
  eliminarReserva(id: number) {
    return this.http.delete(`${this.API_URL}/admin/reservas/${id}`, { headers: this.getAuthHeaders() });
  }

  // Estadísticas
  getStats(): Observable<Stats> {
    return this.http.get<Stats>(`${this.API_URL}/admin/stats`, { headers: this.getAuthHeaders() });
  }
}
