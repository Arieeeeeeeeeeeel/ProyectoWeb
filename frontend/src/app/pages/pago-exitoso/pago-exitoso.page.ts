import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FlowService } from '../../services/flow.service';
import { CartService } from '../../services/cart.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-pago-exitoso',
  templateUrl: './pago-exitoso.page.html',
  styleUrls: ['./pago-exitoso.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
  providers: [CurrencyPipe]
})
export class PagoExitosoPage implements OnInit {
  estado: string = 'Verificando pago...';
  detalles: any = null;

  constructor(
    private route: ActivatedRoute,
    private flowService: FlowService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.flowService.getPaymentStatus(token).subscribe({
          next: (resp) => {
            if (resp.status === 2) { // 2 = pagado
              this.estado = '¡Pago realizado con éxito!';
              this.detalles = resp;
              this.cartService.clearCart();
            } else {
              this.estado = 'El pago no fue exitoso o está pendiente.';
              this.detalles = resp;
            }
          },
          error: () => {
            this.estado = 'No se pudo verificar el estado del pago.';
          }
        });
      } else {
        this.estado = 'No se recibió token de pago.';
      }
    });
  }

  volverAlInicio() {
    this.router.navigate(['/home']);
  }
}
