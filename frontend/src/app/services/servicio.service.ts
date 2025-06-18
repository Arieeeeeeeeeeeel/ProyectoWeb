import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ServicioService {
  private API_URL = 'http://localhost:5000';

  constructor(private http: HttpClient) {}

  getServicios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/services/servicios`);
  }
}
