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
  servicio_nombre?: string;
  vehiculo?: {
    marca: string;
    modelo: string;
    patente: string;
    ano: number;
  };
  color?: string;
  ubicacion?: string;
}

export interface Stats {
  total_usuarios: number;
  total_productos: number;
  total_ofertas: number;
  total_reservas: number;
}

export interface ProductoCompatibilidad {
  producto_id: number;
  marca_auto: string;
  modelo_auto: string;
  ano_desde: number;
  ano_hasta?: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private API_URL = 'http://localhost:5000'; // Cambiado para usar la raíz de la API

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
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
  crearProductoConCompatibilidad(producto: Partial<Producto>, compatibilidad: ProductoCompatibilidad[]) {
    return this.http.post(`${this.API_URL}/products`, { ...producto, compatibilidad }, { headers: this.getAuthHeaders() });
  }
  editarProductoConCompatibilidad(id: number, producto: Partial<Producto>, compatibilidad: ProductoCompatibilidad[]) {
    return this.http.put(`${this.API_URL}/products/${id}`, { ...producto, compatibilidad }, { headers: this.getAuthHeaders() });
  }
  getProductoConCompatibilidad(id: number) {
    return this.http.get(`${this.API_URL}/products/${id}`, { headers: this.getAuthHeaders() });
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
