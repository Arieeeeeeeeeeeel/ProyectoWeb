import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService, UserProfile } from '../../services/auth.service'; // Importa UserProfile
import { NavController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs'; // Para manejar la suscripción

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.page.html',
  styleUrls: ['./user-profile.page.scss'],
  standalone:false,
})
export class UserProfilePage implements OnInit, OnDestroy {
  currentUser: UserProfile | null = null; // Para almacenar los datos del usuario
  private userSubscription: Subscription | undefined;

  constructor(
    private authService: AuthService,
    private navController: NavController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    // Suscribirse para obtener los datos del usuario actual
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (!user) {
        // Si el usuario deja de estar logueado, redirigir
        this.navController.navigateRoot('/home');
      }
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  // Función para ir a la página de edición
  goToEditProfile() {
    this.navController.navigateForward('/user-profile-edit');
  }

  async logout() {
    this.authService.logout();
    await this.presentToast('Sesión cerrada correctamente.', 'light');
    // La redirección a /home se maneja en el subscribe de ngOnInit si el usuario es null
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
}