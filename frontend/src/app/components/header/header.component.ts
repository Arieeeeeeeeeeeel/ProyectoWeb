// src/app/components/header/header.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController, ToastController, NavController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone:false,
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  private authSubscription: Subscription | undefined;

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private navController: NavController,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authSubscription = this.authService.currentUser$
      .subscribe(user => {
        this.isLoggedIn = !!user;
      });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  /**
   * Presenta la alerta de inicio de sesión con campos para correo y contraseña.
   * Ahora incluye una opción para "Olvidé mi contraseña".
   */
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
          cssClass: 'forgot-password-button', // Clase CSS opcional para estilizar
          handler: () => {
            // Cierra la alerta actual y luego presenta la alerta de restablecimiento de contraseña
            alert.dismiss().then(() => {
              this.presentForgotPasswordAlert();
            });
            return false; // Evita que la alerta se cierre automáticamente antes de la dismisión
          }
        },
        {
          text: 'Ingresar',
          handler: (data) => {
            if (!data.email || !data.password) {
              this.presentToast('Por favor, ingresa tu correo y contraseña.', 'danger');
              return false; // Evita que el alert se cierre
            }
            // Llamamos al servicio y nos suscribimos
            this.authService.login(data.email, data.password).subscribe({
              next: user => {
                this.presentToast(`¡Bienvenido, ${user.usuario}!`, 'success');
                this.navController.navigateRoot('/user-profile');
                alert.dismiss(); // Cerramos el alert al iniciar sesión exitosamente
              },
              error: err => {
                this.presentToast('Correo o contraseña incorrectos.', 'danger');
              }
            });
            return false; // Evitamos que el alert se cierre automáticamente
          }
        }
      ]
    });
    await alert.present();
  }

  /**
   * Presenta una alerta para que el usuario ingrese su correo electrónico
   * para restablecer la contraseña.
   */
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
            required: true // Hace el campo requerido
          }
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Alerta de restablecimiento de contraseña cancelada.');
          }
        },
        {
          text: 'Enviar',
          handler: async (data) => {
            const email = data.email;
            if (!email || !this.isValidEmail(email)) {
              this.presentToast('Por favor, ingresa un correo electrónico válido.', 'danger');
              return false; // Evita que el alert se cierre
            }

            // Llama al servicio para restablecer la contraseña
            this.authService.resetPassword(email).subscribe({
              next: () => {
                this.presentToast('Se ha enviado un enlace de restablecimiento a tu correo electrónico.', 'success');
                forgotPasswordAlert.dismiss(); // Cierra el alert de restablecimiento
              },
              error: err => {
                console.error('Error al restablecer contraseña:', err);
                this.presentToast('No se pudo enviar el enlace. Por favor, intenta de nuevo.', 'danger');
              }
            });
            return false; // Evita que el alert se cierre automáticamente hasta que la suscripción se complete
          }
        }
      ]
    });

    await forgotPasswordAlert.present();
  }

  /**
   * Valida un formato de correo electrónico simple.
   * @param email El correo electrónico a validar.
   * @returns `true` si el correo es válido, `false` en caso contrario.
   */
  private isValidEmail(email: string): boolean {
    // Expresión regular simple para validar el formato de correo electrónico
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * Cierra la sesión del usuario.
   */
  async logout() {
    this.authService.logout();
    await this.presentToast('Sesión cerrada.', 'light');
    this.navController.navigateRoot('/home');
  }

  /**
   * Navega a la página de perfil del usuario.
   */
  goToUserPage() {
    this.navController.navigateForward('/user-profile');
  }

  /**
   * Presenta un mensaje de tipo Toast.
   * @param message El mensaje a mostrar.
   * @param color El color del Toast (ej. 'success', 'danger', 'light').
   */
  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'bottom',
    });
    toast.present();
  }

  /**
   * Cierra el menú, si está abierto.
   */
  closeMenu() {
    const menuToggle = document.getElementById('menu-toggle') as HTMLInputElement;
    if (menuToggle) {
      menuToggle.checked = false;
    }
  }
}
