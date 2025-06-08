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

  async presentLoginAlert() {
  const alert = await this.alertController.create({
    header: 'Iniciar Sesión',
    inputs: [
      { name: 'email', type: 'email', placeholder: 'Correo electrónico' },
      { name: 'password', type: 'password', placeholder: 'Contraseña' },
    ],
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Ingresar',
        handler: (data) => {
          if (!data.email || !data.password) {
            this.presentToast('Por favor, ingresa tu correo y contraseña.', 'danger');
            return false;
          }
          // Llamamos al servicio y nos suscribimos
          this.authService.login(data.email, data.password).subscribe({
            next: user => {
              this.presentToast(`¡Bienvenido, ${user.usuario}!`, 'success');
              this.navController.navigateRoot('/user-profile');
              alert.dismiss();        // cerramos el alert
            },
            error: err => {
              this.presentToast('Correo o contraseña incorrectos.', 'danger');
            }
          });
          return false; // evitamos que el alert se cierre automáticamente
        }
      }
    ]
  });
  await alert.present();
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