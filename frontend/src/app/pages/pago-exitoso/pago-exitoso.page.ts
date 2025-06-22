import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FlowService } from '../../services/flow.service';
import { CartService } from '../../services/cart.service';
import { CurrencyPipe } from '@angular/common';
import { IonContent } from "@ionic/angular/standalone";
import { AuthService } from '../../services/auth.service';
import { PurchaseService } from '../../services/purchase.service';
import { UserProfile } from '../../services/auth.service';
import { CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-pago-exitoso',
  templateUrl: './pago-exitoso.page.html',
  styleUrls: ['./pago-exitoso.page.scss'],
  standalone: false
})
export class PagoExitosoPage implements OnInit {
  estado: string = 'Verificando pago...';
  detalles: any = null;

  constructor(
    private route: ActivatedRoute,
    private flowService: FlowService,
    private cartService: CartService,
    private authService: AuthService,
    private purchaseService: PurchaseService,
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
              // --- NUEVO: Guardar la compra en backend ---
              const user: UserProfile | null = this.authService.getCurrentUser();
              const authToken = localStorage.getItem('authToken') || '';
              const cartItems: CartItem[] = this.cartService['_cartItems'].getValue();
              if (user && cartItems.length > 0) {
                const items = cartItems.filter(i => i.productoId).map(i => ({
                  producto_id: Number(i.productoId),
                  cantidad: i.quantity || 1
                }));
                if (items.length > 0) {
                  this.purchaseService.createPurchase(user.personaid, items, authToken).subscribe({
                    next: () => {
                      this.cartService.clearCart();
                    },
                    error: () => {
                      // Si falla, igual limpiar el carrito pero mostrar advertencia
                      this.cartService.clearCart();
                      this.estado += ' (No se pudo registrar la compra en el sistema)';
                    }
                  });
                } else {
                  this.cartService.clearCart();
                }
              } else {
                this.cartService.clearCart();
              }
              // --- FIN NUEVO ---
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
