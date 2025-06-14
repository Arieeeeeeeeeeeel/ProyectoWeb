// src/app/components/header/header.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController, ToastController, NavController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false,
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  cartItemCount: number = 0;
  isAdmin: boolean = false;
  private authSubscription: Subscription | undefined;
  private cartSubscription: Subscription | undefined;

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private navController: NavController,
    private authService: AuthService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.authSubscription = this.authService.currentUser$
      .subscribe(user => {
        this.isLoggedIn = !!user;
        // TEMPORAL: Detectar admin por correo
        this.isAdmin = !!user && (user as any).correo === 'admin@admin.com';
      });

    this.cartSubscription = this.cartService.cartItems$.subscribe(items => {
      this.cartItemCount = items.reduce((count, item) => count + (item.quantity ?? 1), 0);
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  async presentLoginAlert() {
    const alert = await this.alertController.create({
      header: 'Iniciar Sesión',
      inputs: [
        { name: 'email', type: 'email', placeholder: 'Correo electrónico' },
        { name: 'password', type: 'password', placeholder: 'Contraseña' },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Alerta de inicio de sesión cancelada.');
          }
        },
        {
          text: 'Olvidé mi contraseña',
          cssClass: 'forgot-password-button',
          handler: () => {
            alert.dismiss().then(() => {
              this.presentForgotPasswordAlert();
            });
            return false;
          }
        },
        {
          text: 'Ingresar',
          handler: (data) => {
            if (!data.email || !data.password) {
              this.presentToast('Por favor, ingresa tu correo y contraseña.', 'danger');
              return false;
            }
            // Permitir login admin local si backend no responde
            if (data.email === 'admin@admin.com' && data.password === 'admin123') {
              // Intenta login real, pero si falla, haz login local
              this.authService.login(data.email, data.password).subscribe({
                next: user => {
                  this.presentToast('¡Bienvenido, Administrador!', 'success');
                  this.navController.navigateRoot('/admin');
                  alert.dismiss();
                },
                error: err => {
                  // Login local solo para admin
                  const adminUser = {
                    personaid: 0,
                    usuario: 'Administrador',
                    rut: '11.111.111-1',
                    correo: 'admin@admin.com',
                    region: 'Metropolitana de Santiago',
                    comuna: 'Santiago'
                  };
                  localStorage.setItem('currentUser', JSON.stringify(adminUser));
                  this.authService['currentUserSubject'].next(adminUser);
                  this.presentToast('¡Bienvenido, Administrador (modo local)!', 'success');
                  this.navController.navigateRoot('/admin');
                  alert.dismiss();
                }
              });
              return false;
            }
            this.authService.login(data.email, data.password).subscribe({
              next: user => {
                this.presentToast(`¡Bienvenido, ${user.usuario}!`, 'success');
                // Si es admin, redirige a /admin
                if ((user as any).correo === 'admin@admin.com') {
                  this.navController.navigateRoot('/admin');
                } else {
                  this.navController.navigateRoot('/user-profile');
                }
                alert.dismiss();
              },
              error: err => {
                this.presentToast('Correo o contraseña incorrectos.', 'danger');
              }
            });
            return false;
          }
        }
      ]
    });
    await alert.present();
  }

  async presentForgotPasswordAlert() {
    const forgotPasswordAlert = await this.alertController.create({
      header: 'Restablecer Contraseña',
      message: 'Ingresa tu correo electrónico para enviar un enlace de restablecimiento de contraseña.',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'Correo electrónico',
          attributes: {
            required: true
          }
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Enviar',
          handler: async (data) => {
            const email = data.email;
            if (!email || !this.isValidEmail(email)) {
              this.presentToast('Por favor, ingresa un correo electrónico válido.', 'danger');
              return false;
            }
            this.authService.requestPasswordReset(email).subscribe({
              next: () => {
                this.presentToast('Se ha enviado un enlace de restablecimiento a tu correo electrónico.', 'success');
                forgotPasswordAlert.dismiss();
              },
              error: () => {
                this.presentToast('No se pudo enviar el enlace. Por favor, intenta de nuevo.', 'danger');
              }
            });
            return false;
          }
        }
      ]
    });

    await forgotPasswordAlert.present();
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async logout() {
    this.authService.logout();
    await this.presentToast('Sesión cerrada.', 'light');
    this.navController.navigateRoot('/home');
  }

  goToUserPage() {
    this.navController.navigateForward('/user-profile');
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'bottom',
    });
    toast.present();
  }

  closeMenu() {
    const menuToggle = document.getElementById('menu-toggle') as HTMLInputElement;
    if (menuToggle) {
      menuToggle.checked = false;
    }
  }
}

