import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface CartItem {
  productoId?: string;
  id?: string;
  nombre: string;
  imagen?: string;
  precio: number;
  quantity?: number;
  stock?: number;
  detalles?: any;
}

@Injectable({
  providedIn: 'root'
})
export class CartApiService {
  private apiUrl = environment.backendUrl + '/cart';

  constructor(private http: HttpClient) {}

  getCart(usuarioId: number) {
    const token = localStorage.getItem('authToken') || '';
    const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    return this.http.get(`${this.apiUrl}/carrito/${usuarioId}`, headers);
  }

  addOrUpdateItem(usuarioId: number, productoId: number, cantidad: number) {
    const token = localStorage.getItem('authToken') || '';
    const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    return this.http.post(`${this.apiUrl}/carrito/${usuarioId}/item`, {
      producto_id: productoId,
      cantidad: cantidad
    }, headers);
  }

  removeItem(usuarioId: number, productoId: number) {
    const token = localStorage.getItem('authToken') || '';
    const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    return this.http.delete(`${this.apiUrl}/carrito/${usuarioId}/item/${productoId}`, headers);
  }

  clearCart(usuarioId: number) {
    const token = localStorage.getItem('authToken') || '';
    const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    return this.http.post(`${this.apiUrl}/carrito/${usuarioId}/vaciar`, {}, headers);
  }
}
