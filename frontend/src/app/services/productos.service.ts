import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  en_oferta?: boolean;
  mostrar_en_inicio?: boolean;
  user_valoracion?: number; // <-- Añadido para soporte de valoración de usuario
  compatibilidad?: Array<{
    marca_auto: string;
    modelo_auto: string;
    ano_desde?: number;
    ano_hasta?: number;
  }>;
}

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private API_URL = 'http://localhost:5000/products';

  constructor(private http: HttpClient) {}

  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.API_URL);
  }

  getProducto(id: number): Observable<Producto> {
    const token = localStorage.getItem('authToken');
    const headers = token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : undefined;
    return this.http.get<Producto>(`${this.API_URL}/${id}`, { headers });
  }

  valorarProducto(id: number, rating: number): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : undefined;
    return this.http.post(`${this.API_URL}/${id}/valorar`, { rating }, { headers });
  }

  updateStock(items: { producto_id: number, cantidad: number }[]): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : undefined;
    return this.http.post('http://localhost:5000/products/update_stock', { items }, { headers });
  }

  getProductosFiltrados(filtros: { marca?: string; modelo?: string; ano?: number; repuesto?: string }): Observable<Producto[]> {
    let params: any = {};
    if (filtros.marca) params.marca = filtros.marca;
    if (filtros.modelo) params.modelo = filtros.modelo;
    if (filtros.ano) params.ano = filtros.ano;
    if (filtros.repuesto) params.repuesto = filtros.repuesto;
    return this.http.get<Producto[]>(this.API_URL, { params });
  }
}
