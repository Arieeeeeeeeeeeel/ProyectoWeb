import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface DireccionUsuario {
  id: string;
  calle: string;
  ciudad: string;
  codigoPostal: string;
  esPrincipal: boolean;
}

@Injectable({ providedIn: 'root' })
export class UbicacionesService {
  private apiUrl = 'http://localhost:5000/ubicaciones/api/ubicaciones';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  getUserAddresses(): Observable<DireccionUsuario[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getAuthHeaders() }).pipe(
      map((direcciones: any[]) => direcciones.map(d => ({
        id: d.direccion_id,
        calle: d.calle,
        ciudad: d.ciudad,
        codigoPostal: d.codigoPostal,
        esPrincipal: d.esPrincipal
      })))
    );
  }

  addUserAddress(address: Omit<DireccionUsuario, 'id'>): Observable<DireccionUsuario> {
    return this.http.post<DireccionUsuario>(this.apiUrl, address, { headers: this.getAuthHeaders() });
  }

  deleteUserAddress(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  setDefaultAddress(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/default`, {}, { headers: this.getAuthHeaders() });
  }
}
