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
            this.authService.login(data.email, data.password).subscribe({
              next: user => {
                this.presentToast(`¡Bienvenido, ${user.usuario}!`, 'success');
                this.navController.navigateRoot('/user-profile');
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
