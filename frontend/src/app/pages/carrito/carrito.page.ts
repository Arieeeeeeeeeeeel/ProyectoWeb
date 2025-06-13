import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, AlertController, NavController } from '@ionic/angular';
import { FormsModule } from '@angular/forms'; // <--- Make sure FormsModule is imported here
import { CartService, CartItem } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
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
class UserService {
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
  standalone: false,
  providers: [UserService]
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
    private navController: NavController
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
    const newQuantity = item.quantity + change;
    if (newQuantity > 0) {
      const success = this.cartService.updateItemQuantity(item.productoId, newQuantity);
      if (!success) {
        this.presentToast('No hay suficiente stock disponible para esta cantidad.', 'warning');
      }
    } else {
      this.removeItem(item.productoId);
    }
  }

  removeItem(productId: string) {
    this.cartService.removeItem(productId);
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

    // Simulación de éxito del pedido
    await this.presentAlertOrderSuccess();
    this.cartService.clearCart();
    this.navController.navigateRoot('/home'); // O a una página de confirmación de pedido
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