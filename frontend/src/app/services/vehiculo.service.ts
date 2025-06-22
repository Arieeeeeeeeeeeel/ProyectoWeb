import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Vehiculo {
  vehiculo_id: number;
  marca: string;
  modelo: string;
  ano: number;
  patente: string;
  tipo_combustible: string;
  color: string;
  apodo?: string;
  usuario_id: number;
}

@Injectable({ providedIn: 'root' })
export class VehiculoService {
  private API_URL = 'http://localhost:5000/vehicles';

  constructor(private http: HttpClient) {}

  getVehiculosUsuario(personaid: number): Observable<Vehiculo[]> {
    const token = localStorage.getItem('authToken');
    const headers = token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : undefined;
    return this.http.get<Vehiculo[]>(`${this.API_URL}/user/${personaid}`, { headers });
  }

  crearVehiculo(personaid: number, vehiculo: Partial<Vehiculo>): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : undefined;
    return this.http.post(`${this.API_URL}/${personaid}/new_car`, vehiculo, { headers });
  }

  eliminarVehiculo(vehiculo_id: number): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : undefined;
    return this.http.delete(`${this.API_URL}/${vehiculo_id}`, { headers });
  }
}
