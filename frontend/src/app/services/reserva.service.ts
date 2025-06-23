import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReservaService {
  private API_URL = 'http://localhost:5000/reservas';

  constructor(private http: HttpClient) {}

  crearReserva(reserva: any): Observable<any> {
    const token = localStorage.getItem('authToken') || '';
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.post<any>(this.API_URL, reserva, { headers });
  }

  obtenerNombreCompleto(usuario_id: number): Observable<any> {
    const token = localStorage.getItem('authToken') || '';
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.get<any>(`${this.API_URL}/nombre_completo/${usuario_id}`, { headers });
  }

  getReservasPorFecha(fecha: string): Observable<any[]> {
    const token = localStorage.getItem('authToken') || '';
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.get<any[]>(`${this.API_URL}/fecha/${fecha}`, { headers });
  }
}
