import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService, UserProfile } from '../../services/auth.service'; 
import { NavController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.page.html',
  styleUrls: ['./user-profile.page.scss'],
  standalone:false,
})
export class UserProfilePage implements OnInit, OnDestroy {
  currentUser: UserProfile | null = null;
  private userSubscription: Subscription | undefined;

  constructor(
    private authService: AuthService,
    private navController: NavController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (!user) {
        this.navController.navigateRoot('/home');
      }
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  goToEditProfile() {
    this.navController.navigateForward('/user-profile-edit');
  }

  async logout() {
    this.authService.logout();
    await this.presentToast('Sesión cerrada correctamente.', 'light');
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