import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';

interface Compra {
  compra_id: number;
  fecha_compra: string;
  total: number;
  estado_pago: string;
  detalles: any[];
}

@Component({
  selector: 'app-user-purchases',
  templateUrl: './user-purchases.page.html',
  styleUrls: ['./user-purchases.page.scss'],
  standalone: false
})
export class UserPurchasesPage implements OnInit {
  compras: Compra[] = [];
  loading = true;
  error = '';

  constructor(private authService: AuthService, private http: HttpClient) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.error = 'No has iniciado sesión.';
      this.loading = false;
      return;
    }
    const token = localStorage.getItem('authToken');
    this.http.get<Compra[]>(`http://localhost:5000/purchases/${user.personaid}/purchases`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    }).subscribe({
      next: (data: any) => {
        this.compras = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar las compras.';
        this.loading = false;
      }
    });
  }
}
