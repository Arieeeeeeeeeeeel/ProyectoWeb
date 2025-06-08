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
        { name: 'email', type: 'email', placeholder: 'Correo electrónico', attributes: { required: true } },
        { name: 'password', type: 'password', placeholder: 'Contraseña', attributes: { required: true } },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel', cssClass: 'secondary', handler: () => { console.log('Login cancelado'); return true; } },
        {
          text: 'Ingresar',
          handler: (data) => {
            if (!data.email || !data.password) {
              this.presentToast('Por favor, ingresa tu correo y contraseña.', 'danger');
              return false;
            }

            // LLAMAR AL SERVICIO DE AUTENTICACIÓN CON LOS DATOS INGRESADOS
            const loginSuccessful = this.authService.login(data.email, data.password);

            if (loginSuccessful) {
              this.presentToast('¡Bienvenido!', 'success');
              return true; // Cerrar el alert
            } else {
              this.presentToast('Correo o contraseña incorrectos.', 'danger');
              return false; // No cerrar el alert
            }
          },
        },
      ],
    });

    await alert.present();

    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    if (forgotPasswordLink) {
      forgotPasswordLink.addEventListener('click', () => {
        alert.dismiss();
        this.navController.navigateForward('/forgot-password');
      });
    }
  }

  // --- Si usas ModalController, modifica tu presentLoginModal así: ---
  // async presentLoginModal() {
  //   const modal = await this.modalController.create({
  //     component: LoginModalComponent, // Tu componente de modal de login
  //     breakpoints: [0, 0.5, 0.8],
  //     initialBreakpoint: 0.8
  //   });
  //   await modal.present();

  //   const { data, role } = await modal.onWillDismiss();
  //   if (role === 'login' && data) {
  //     // Aquí el modal ya debería haber llamado a authService.login() si el login fue exitoso
  //     // en tu LoginModalComponent. Por lo tanto, aquí quizás solo necesites un console.log
  //     console.log('Modal de login cerrado, rol:', role, 'datos:', data);
  //     // El estado de login se actualiza automáticamente via el BehaviorSubject en AuthService
  //   } else {
  //     console.log('Modal dismissed or login cancelled');
  //   }
  // }


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