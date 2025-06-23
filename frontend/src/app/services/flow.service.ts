import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FlowPaymentData {
  subject: string;
  currency: string;
  amount: number;
  email: string;
  urlReturn: string;
  urlConfirmation: string;
  commerceOrder: string;
  optional?: string;
}

@Injectable({ providedIn: 'root' })
export class FlowService {
  private backendUrl = 'http://localhost:5000/api/flow'; // Cambia si tu backend está en otra URL

  constructor(private http: HttpClient) {}

  createPayment(data: FlowPaymentData): Observable<any> {
    return this.http.post(`${this.backendUrl}/create-payment`, data);
  }

  getPaymentStatus(token: string): Observable<any> {
    return this.http.get(`${this.backendUrl}/payment-status`, { params: { token } });
  }
}
