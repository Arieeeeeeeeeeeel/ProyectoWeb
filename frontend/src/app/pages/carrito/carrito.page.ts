import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, AlertController, NavController } from '@ionic/angular';
import { FormsModule } from '@angular/forms'; // <--- Make sure FormsModule is imported here
import { CartService, CartItem } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { ProductosService } from '../../services/productos.service';
import { FlowService } from '../../services/flow.service';
import { UbicacionesService, DireccionUsuario as BackendDireccionUsuario } from '../../services/ubicaciones.service';
import { Subscription, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { PurchaseService } from '../../services/purchase.service'; // <--- Importar el servicio de compra

// Interfaz para una dirección de usuario (ejemplo)
interface DireccionUsuario {
  id: string;
  calle: string;
  ciudad: string;
  codigoPostal: string;
  esPrincipal: boolean;
}

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.page.html',
  styleUrls: ['./carrito.page.scss'],
  standalone: false
})
export class CarritoPage implements OnInit, OnDestroy {
  // === VERIFICA QUE TODAS ESTAS PROPIEDADES ESTÉN DECLARADAS ===
  cartItems: CartItem[] = [];
  cartTotal: number = 0;
  isLoggedIn: boolean = false;
  userAddresses: DireccionUsuario[] = [];

  deliveryOption: 'pickup' | 'delivery' = 'delivery';
  selectedAddressId: string | null = null;
  customAddress: { calle: string, ciudad: string, codigoPostal: string } = { calle: '', ciudad: '', codigoPostal: '' };
  paymentMethod: 'card' = 'card';

  private cartSubscription: Subscription | undefined;
  private authSubscription: Subscription | undefined;
  // =============================================================

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private toastController: ToastController,
    private alertController: AlertController,
    private navController: NavController,
    private productosService: ProductosService,
    private flowService: FlowService, // <--- Agregar FlowService
    private ubicacionesService: UbicacionesService, // <--- Agregar UbicacionesService
    private purchaseService: PurchaseService // <--- Agrega el servicio de compra
  ) { }

  ngOnInit() {
    this.cartSubscription = this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.cartTotal = this.cartService.getCartTotal();
    });

    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      if (this.isLoggedIn) {
        this.loadUserAddresses();
      } else {
        this.userAddresses = []; // Limpiar direcciones si el usuario no está logueado
      }
    });
  }

  ngOnDestroy() {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  loadUserAddresses() {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.userAddresses = [];
      return;
    }
    this.ubicacionesService.getUserAddresses().subscribe({
      next: (addresses: any[]) => {
        this.userAddresses = addresses.map(addr => ({
          id: addr.id,
          calle: addr.calle,
          ciudad: addr.ciudad,
          codigoPostal: addr.codigoPostal,
          esPrincipal: addr.esPrincipal
        }));
      },
      error: () => {
        this.userAddresses = [];
      }
    });
  }

  updateQuantity(item: CartItem, change: number) {
    console.log('[CarritoPage] updateQuantity', item, change);
    if (item.hasOwnProperty('productoId') && typeof item.quantity === 'number') {
      const newQuantity = item.quantity + change;
      if (newQuantity > 0) {
        if (item.productoId) {
          // Optimistic update: actualiza localmente y sincroniza en segundo plano
          const prevQuantity = item.quantity;
          const success = this.cartService.updateItemQuantity(item.productoId, newQuantity);
          if (!success) {
            // Si falla, revierte el cambio local y muestra error
            this.cartService.updateItemQuantity(item.productoId, prevQuantity);
            this.presentToast('No hay suficiente stock disponible para esta cantidad.', 'warning');
          }
        }
      } else {
        if (item.productoId) {
          this.removeItem(item.productoId);
        }
      }
    }
  }

  removeItem(productIdOrId: string | undefined) {
    console.log('[CarritoPage] removeItem', productIdOrId);
    if (!productIdOrId) return;
    // Optimistic update: elimina localmente y sincroniza en segundo plano
    const prevItems = [...this.cartItems];
    this.cartService.removeItem(productIdOrId);
    // Aquí podrías agregar lógica para revertir si la operación falla en backend
    // Por ahora solo muestra el toast
    this.presentToast('Producto eliminado del carrito.', 'danger');
  }

  // Lógica para el método de pago
  onPaymentMethodChange() {
    // Ya no es necesario, solo hay una opción
  }

  async processCheckout() {
    if (this.cartItems.length === 0) {
      await this.presentToast('Tu carrito está vacío.', 'danger');
      return;
    }
    let addressToUse = '';
    if (this.deliveryOption === 'delivery') {
      if (this.isLoggedIn && this.selectedAddressId && this.selectedAddressId !== 'custom') {
        const selectedAddr = this.userAddresses.find(addr => addr.id === this.selectedAddressId);
        addressToUse = selectedAddr ? `${selectedAddr.calle}, ${selectedAddr.ciudad}, ${selectedAddr.codigoPostal}` : 'Dirección desconocida';
      } else if (this.selectedAddressId === 'custom') {
        if (!this.customAddress.calle || !this.customAddress.ciudad || !this.customAddress.codigoPostal) {
          await this.presentToast('Por favor, completa todos los campos de la dirección personalizada.', 'danger');
          return;
        }
        addressToUse = `${this.customAddress.calle}, ${this.customAddress.ciudad}, ${this.customAddress.codigoPostal}`;
      } else {
        await this.presentToast('Por favor, selecciona una opción de envío o ingresa una dirección.', 'danger');
        return;
      }
    } else { // pickup
      addressToUse = 'Retiro en tienda';
    }
    // Preguntar si se debe guardar la dirección personalizada
    if (this.selectedAddressId === 'custom' && this.isLoggedIn) {
      const alert = await this.alertController.create({
        header: '¿Guardar dirección?',
        message: '¿Deseas guardar esta dirección en tus ubicaciones para futuros pedidos?',
        buttons: [
          {
            text: 'No',
            role: 'cancel',
            handler: async () => {
              await this.realizarPago(addressToUse);
            }
          },
          {
            text: 'Sí',
            handler: async () => {
              this.ubicacionesService.addUserAddress({
                calle: this.customAddress.calle,
                ciudad: this.customAddress.ciudad,
                codigoPostal: this.customAddress.codigoPostal,
                esPrincipal: false
              }).subscribe({
                next: async () => {
                  this.loadUserAddresses();
                  this.presentToast('Dirección guardada en tu perfil.', 'success');
                  await this.realizarPago(addressToUse);
                },
                error: async () => {
                  this.presentToast('No se pudo guardar la dirección.', 'danger');
                  await this.realizarPago(addressToUse);
                }
              });
            }
          }
        ]
      });
      await alert.present();
      return;
    }
    await this.realizarPago(addressToUse);
  }

  async realizarPago(addressToUse: string) {
    // Validación del método de pago
    // Ya no es necesario validar efectivo
    // Aquí iría la lógica real para procesar el pedido:
    // 1. Enviar los datos del carrito, dirección y método de pago a tu backend.
    // 2. Manejar la respuesta del backend (éxito/error).
    // 3. Limpiar el carrito si el pedido fue exitoso.
    // --- ELIMINADO: Registro de compra antes del pago exitoso ---
    // El registro de la compra se debe hacer solo después del pago exitoso (en pago-exitoso.page.ts)
    console.log('Procesando pedido...');
    console.log('Items:', this.cartItems);
    console.log('Total:', this.cartTotal);
    console.log('Opción de entrega:', this.deliveryOption);
    console.log('Dirección de entrega/retiro:', addressToUse);
    console.log('Método de pago:', this.paymentMethod);
    // === AGREGAR RESERVAS A HORAS AGENDADAS ADMIN ===
    try {
      const horasStr = localStorage.getItem('admin_horas');
      let horas: any[] = horasStr ? JSON.parse(horasStr) : [];
      this.cartItems.forEach(item => {
        if (item.detalles && item.detalles.servicio && item.detalles.fecha && item.detalles.hora && item.detalles.nombre) {
          const id = Date.now() + Math.floor(Math.random() * 10000);
          const existe = horas.some(h =>
            h.cliente === item.detalles.nombre &&
            h.fecha === `${item.detalles.fecha} ${item.detalles.hora}` &&
            h.detalle === item.detalles.servicio
          );
          if (!existe) {
            horas.push({
              id,
              cliente: item.detalles.nombre,
              fecha: `${item.detalles.fecha} ${item.detalles.hora}`,
              prioridad: 3,
              detalle: item.detalles.servicio
            });
          }
        }
      });
      localStorage.setItem('admin_horas', JSON.stringify(horas));
    } catch (e) {
      await this.presentToast('No se pudo actualizar las horas agendadas.', 'warning');
    }
    // === FIN AGREGAR RESERVAS A HORAS AGENDADAS ADMIN ===
    // === INTEGRACIÓN FLOW ===
    try {
      const user = this.authService.getCurrentUser();
      if (!user) {
        await this.presentToast('Debes iniciar sesión para pagar.', 'danger');
        return;
      }
      const subject = `Compra de productos en LYL - ${user.usuario}`;
      const email = user.correo;
      const amount = this.cartTotal;
      const urlReturn = 'http://localhost:5000/api/flow/retorno';
      const urlConfirmation = window.location.origin + '/api/flow/confirmacion';
      const commerceOrder = Date.now().toString();
      const resp = await this.flowService.createPayment({
        subject,
        currency: 'CLP',
        amount,
        email,
        urlReturn,
        urlConfirmation,
        commerceOrder
      }).toPromise();
      if (resp && resp.token && resp.url) {
        window.location.href = `${resp.url}?token=${resp.token}`;
        return;
      } else {
        await this.presentToast('No se pudo iniciar el pago con Flow.', 'danger');
        return;
      }
    } catch (e) {
      await this.presentToast('Error al conectar con Flow.', 'danger');
      return;
    }
    await this.presentAlertOrderSuccess();
    this.cartService.clearCart();
    this.navController.navigateRoot('/home');
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }

  async presentAlertOrderSuccess(isCash: boolean = false) {
    const alert = await this.alertController.create({
      header: '¡Pedido Realizado!',
      message: isCash
        ? 'Tu pedido fue registrado. Estará listo para retiro en tienda entre 2 a 5 días hábiles. ¡Gracias por tu compra!'
        : 'Su pedido fue hecho a la perfección. ¡Gracias por su compra!',
      buttons: ['OK']
    });
    await alert.present();
  }
}