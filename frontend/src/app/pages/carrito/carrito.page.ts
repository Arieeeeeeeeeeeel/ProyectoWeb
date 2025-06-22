import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, AlertController, NavController } from '@ionic/angular';
import { FormsModule } from '@angular/forms'; // <--- Make sure FormsModule is imported here
import { CartService, CartItem } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { ProductosService } from '../../services/productos.service';
import { FlowService } from '../../services/flow.service';
import { Subscription, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

// Interfaz para una dirección de usuario (ejemplo)
interface UserAddress {
  id: string;
  street: string;
  city: string;
  zipCode: string;
  isDefault: boolean;
}

// SERVICIO SIMULADO PARA USUARIO Y DIRECCIONES
// En un proyecto real, esto sería un servicio separado (e.g., UserService)
export class UserService {
  getUserAddresses(): Observable<UserAddress[]> {
    // Simula una llamada a la API o datos de usuario
    return of([
      { id: 'addr1', street: 'Av. Siempre Viva 742', city: 'Santiago', zipCode: '8320000', isDefault: true },
      { id: 'addr2', street: 'Calle Falsa 123', city: 'Viña del Mar', zipCode: '2520000', isDefault: false }
    ]);
  }
}
// FIN SERVICIO SIMULADO

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
  userAddresses: UserAddress[] = [];

  deliveryOption: 'pickup' | 'delivery' = 'delivery';
  selectedAddressId: string | null = null;
  customAddress: { street: string, city: string, zipCode: string } = { street: '', city: '', zipCode: '' };
  paymentMethod: 'credit' | 'debit' | 'cash' = 'credit';

  private cartSubscription: Subscription | undefined;
  private authSubscription: Subscription | undefined;
  // =============================================================

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private userService: UserService,
    private toastController: ToastController,
    private alertController: AlertController,
    private navController: NavController,
    private productosService: ProductosService,
    private flowService: FlowService // <--- Agregar FlowService
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
    this.userService.getUserAddresses().subscribe(addresses => {
      this.userAddresses = addresses;
      // Seleccionar la dirección por defecto si existe
      const defaultAddress = addresses.find(addr => addr.isDefault);
      if (defaultAddress) {
        this.selectedAddressId = defaultAddress.id;
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
    if (this.deliveryOption === 'pickup' && this.paymentMethod !== 'cash') {
      // Si el retiro es en tienda, permitir efectivo
      // Si el usuario cambia a pickup y el pago no es efectivo, podría avisarle o forzarlo.
      // Por simplicidad, aquí no hacemos nada, solo limitamos las opciones en el HTML.
    }
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
        addressToUse = selectedAddr ? `${selectedAddr.street}, ${selectedAddr.city}, ${selectedAddr.zipCode}` : 'Dirección desconocida';
      } else if (this.selectedAddressId === 'custom') {
        if (!this.customAddress.street || !this.customAddress.city || !this.customAddress.zipCode) {
          await this.presentToast('Por favor, completa todos los campos de la dirección personalizada.', 'danger');
          return;
        }
        addressToUse = `${this.customAddress.street}, ${this.customAddress.city}, ${this.customAddress.zipCode}`;
      } else {
        await this.presentToast('Por favor, selecciona una opción de envío o ingresa una dirección.', 'danger');
        return;
      }
    } else { // pickup
      addressToUse = 'Retiro en tienda';
    }

    // Validación del método de pago
    if (this.deliveryOption === 'pickup' && this.paymentMethod !== 'cash' && this.paymentMethod !== 'credit' && this.paymentMethod !== 'debit') {
        await this.presentToast('Para retiro en tienda, solo se acepta efectivo, crédito o débito.', 'danger');
        return;
    }
    if (this.deliveryOption === 'delivery' && this.paymentMethod === 'cash') {
        await this.presentToast('El pago en efectivo no está disponible para envíos a domicilio.', 'danger');
        return;
    }


    // Aquí iría la lógica real para procesar el pedido:
    // 1. Enviar los datos del carrito, dirección y método de pago a tu backend.
    // 2. Manejar la respuesta del backend (éxito/error).
    // 3. Limpiar el carrito si el pedido fue exitoso.

    console.log('Procesando pedido...');
    console.log('Items:', this.cartItems);
    console.log('Total:', this.cartTotal);
    console.log('Opción de entrega:', this.deliveryOption);
    console.log('Dirección de entrega/retiro:', addressToUse);
    console.log('Método de pago:', this.paymentMethod);

    // === AGREGAR RESERVAS A HORAS AGENDADAS ADMIN ===
    try {
      // Cargar horas agendadas actuales
      const horasStr = localStorage.getItem('admin_horas');
      let horas: any[] = horasStr ? JSON.parse(horasStr) : [];

      // Por cada item de tipo reserva, agregarlo a horas agendadas si no existe
      this.cartItems.forEach(item => {
        if (item.detalles && item.detalles.servicio && item.detalles.fecha && item.detalles.hora && item.detalles.nombre) {
          // Genera un identificador único para la hora agendada
          const id = Date.now() + Math.floor(Math.random() * 10000);
          // Verifica si ya existe una hora igual (por servicio, fecha, hora y nombre)
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
              prioridad: 3, // Puedes ajustar la prioridad según tu lógica
              detalle: item.detalles.servicio
            });
          }
        }
      });

      // Guarda las horas agendadas actualizadas
      localStorage.setItem('admin_horas', JSON.stringify(horas));
    } catch (e) {
      await this.presentToast('No se pudo actualizar las horas agendadas.', 'warning');
    }
    // === FIN AGREGAR RESERVAS A HORAS AGENDADAS ADMIN ===

    // Actualizar stock en backend
    try {
      const itemsToUpdate = this.cartItems.map(item => ({
        producto_id: Number(item.productoId),
        cantidad: item.quantity || 1
      }));
      if (itemsToUpdate.length > 0) {
        await this.productosService.updateStock(itemsToUpdate).toPromise();
      }
    } catch (e) {
      await this.presentToast('No se pudo actualizar el stock en el servidor.', 'warning');
    }

    // === INTEGRACIÓN FLOW ===
    try {
      const user = this.authService.getCurrentUser();
      if (!user) {
        await this.presentToast('Debes iniciar sesión para pagar.', 'danger');
        return;
      }
      // Construir subject y email
      const subject = `Compra de productos en LYL - ${user.usuario}`;
      const email = user.correo;
      // Monto total
      const amount = this.cartTotal;
      // Redirecciones (ajusta las URLs a tu entorno)
      const urlReturn = 'http://localhost:5000/api/flow/retorno';
      const urlConfirmation = window.location.origin + '/api/flow/confirmacion';
      // Crear pago en Flow
      const commerceOrder = Date.now().toString(); // identificador único simple
      const resp = await this.flowService.createPayment({
        subject,
        currency: 'CLP',
        amount,
        email,
        urlReturn,
        urlConfirmation,
        commerceOrder // <--- nuevo campo
      }).toPromise();
      if (resp && resp.token && resp.url) {
        // Redirigir a Flow
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

  async presentAlertOrderSuccess() {
    const alert = await this.alertController.create({
      header: '¡Pedido Realizado!',
      message: 'Su pedido fue hecho a la perfección. ¡Gracias por su compra!',
      buttons: ['OK']
    });
    await alert.present();
  }
}