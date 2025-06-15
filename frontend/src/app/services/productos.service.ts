import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  private API_URL = 'https://3aeb-190-8-112-252.ngrok-free.app/products';

  constructor(private http: HttpClient) {}

  private getNgrokHeaders(): HttpHeaders {
    return new HttpHeaders({
      'ngrok-skip-browser-warning': 'true'
    });
  }

  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.API_URL, { headers: this.getNgrokHeaders() });
  }

  getProducto(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.API_URL}/${id}`, { headers: this.getNgrokHeaders() });
  }
}
