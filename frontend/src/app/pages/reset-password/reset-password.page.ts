import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone:false,
})
export class ResetPasswordPage implements OnInit {
  newPassword!: string;
  confirmPassword!: string;
  token!: string;
  personaid!: number;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      this.personaid = params['id'] ? +params['id'] : 0;
    });
  }

  async resetPassword() {
    if (!this.newPassword || this.newPassword.length < 6) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'La contraseña debe tener mínimo 6 caracteres.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Las contraseñas no coinciden.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    if (!this.token || !this.personaid) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Faltan token o identificador de usuario.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    this.authService
      .confirmPasswordReset(this.personaid, this.token, this.newPassword)
      .subscribe({
        next: async () => {
          const toast = await this.toastController.create({
            message: 'Contraseña restablecida con éxito.',
            duration: 2000,
            color: 'success'
          });
          await toast.present();
          this.router.navigateByUrl('/home', { replaceUrl: true });
        },
        error: async err => {
          const alert = await this.alertController.create({
            header: 'Error',
            message: err.error?.error || 'Problema al restablecer contraseña.',
            buttons: ['OK']
          });
          await alert.present();
        }
      });
  }
}