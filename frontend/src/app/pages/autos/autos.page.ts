import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';

export interface AutoUsuario {
  id: string;
  marca: string;
  modelo: string;
  ano: number;
}

@Component({
  selector: 'app-autos',
  templateUrl: './autos.page.html',
  styleUrls: ['./autos.page.scss']
})
export class AutosPage implements OnInit {
  autos: AutoUsuario[] = [];

  constructor(private alertCtrl: AlertController, private toastCtrl: ToastController) {}

  ngOnInit() {
    this.cargarAutos();
  }

  cargarAutos() {
    const autosGuardados = localStorage.getItem('autosUsuario');
    this.autos = autosGuardados ? JSON.parse(autosGuardados) : [];
  }

  async agregarAuto() {
    const alert = await this.alertCtrl.create({
      header: 'Agregar auto',
      inputs: [
        { name: 'marca', type: 'text', placeholder: 'Marca' },
        { name: 'modelo', type: 'text', placeholder: 'Modelo' },
        { name: 'ano', type: 'number', placeholder: 'Año' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (data) => {
            if (!data.marca || !data.modelo || !data.ano) {
              this.presentToast('Completa todos los campos', 'danger');
              return false;
            }
            const nuevoAuto: AutoUsuario = {
              id: Date.now().toString(),
              marca: data.marca,
              modelo: data.modelo,
              ano: Number(data.ano)
            };
            this.autos.push(nuevoAuto);
            localStorage.setItem('autosUsuario', JSON.stringify(this.autos));
            this.presentToast('Auto guardado', 'success');
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  eliminarAuto(id: string) {
    this.autos = this.autos.filter(a => a.id !== id);
    localStorage.setItem('autosUsuario', JSON.stringify(this.autos));
    this.presentToast('Auto eliminado', 'warning');
  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 1500, color });
    toast.present();
  }
}
