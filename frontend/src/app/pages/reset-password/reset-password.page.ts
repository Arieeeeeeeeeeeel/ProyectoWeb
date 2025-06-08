import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone:false,
})
export class ResetPasswordPage implements OnInit {
  newPassword!: string;
  confirmPassword!: string;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {}

  async resetPassword() {
    if (this.newPassword !== this.confirmPassword) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Las contraseñas no coinciden. Por favor, inténtalo de nuevo.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    // Aquí es donde integrarías la lógica para enviar la nueva contraseña a tu backend.
    // Por ejemplo, podrías llamar a un servicio de autenticación.
    console.log('Nueva Contraseña:', this.newPassword);

    // Simulación de éxito
    const toast = await this.toastController.create({
      message: 'Tu contraseña ha sido restablecida con éxito.',
      duration: 2000,
      color: 'success',
    });
    await toast.present();

    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}