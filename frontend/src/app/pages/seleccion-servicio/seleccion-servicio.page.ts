import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonContent, IonCard, IonLabel } from "@ionic/angular/standalone";

@Component({
  selector: 'app-seleccion-servicio',
  templateUrl: './seleccion-servicio.page.html',
  styleUrls: ['./seleccion-servicio.page.scss'],
  standalone:false,
})
export class SeleccionPage {

  reserva = {
    servicio: '',
    fecha: '',
    marca: '',
    modelo: '',
    anio: null,
    nombre: '',
    ubicacion: '',
    notas: '',
    aceptaTerminos: false
  };

  guardarReserva() {
    if (this.reserva.aceptaTerminos) {
      console.log('Reserva guardada:', this.reserva);
      // Aquí podrías llamar a un servicio para guardar en una API o base de datos
    }
  }
}
