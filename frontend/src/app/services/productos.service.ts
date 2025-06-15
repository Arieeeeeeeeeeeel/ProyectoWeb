import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  en_oferta?: boolean;
  mostrar_en_inicio?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private API_URL = 'http://localhost:5000/products';

  constructor(private http: HttpClient) {}

  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.API_URL);
  }

  getProducto(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.API_URL}/${id}`);
  }
}
