import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PurchaseService {
  private API_URL = 'http://localhost:5000';

  constructor(private http: HttpClient) {}

  createPurchase(personaid: number, items: { producto_id: number, cantidad: number }[], direccion_envio: string | null, token: string): Observable<any> {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    const payload: any = { items };
    if (direccion_envio) payload.direccion_envio = direccion_envio;
    return this.http.post(`${this.API_URL}/purchases/${personaid}/purchase`, payload, { headers });
  }
}
