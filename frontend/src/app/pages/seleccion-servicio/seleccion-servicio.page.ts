import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../../services/cart.service';
import { ToastController } from '@ionic/angular';

export interface CartItem {
  id: string;
  nombre: string;
  imagen?: string;
  precio: number;
  stock?: number;
  detalles?: any;
}

@Component({
  selector: 'app-seleccion-servicio',
  templateUrl: './seleccion-servicio.page.html',
  styleUrls: ['./seleccion-servicio.page.scss'],
  standalone: false,
})
export class SeleccionPage {
  minDate: string;
  horasDisponibles: string[] = [];
  reservaPrecio: number = 50000;

  reserva = {
    servicio: '',
    fecha: '',
    hora: '',
    marca: '',
    modelo: '',
    anio: null as number | null,
    nombre: '',
    ubicacion: '',
    aceptaTerminos: false,
    notas: ''
  };

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private cartService: CartService,
    private router: Router,
    private toastController: ToastController
  ) {
    this.route.queryParams.subscribe(params => {
      if (params['servicio']) {
        this.reserva.servicio = params['servicio'];
      }
    });
    this.minDate = this.getToday();
    this.horasDisponibles = this.generarHorasDisponibles();
  }

  getToday(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  generarHorasDisponibles(): string[] {
    const horas: string[] = [];
    for (let h = 9; h <= 20; h++) {
      if (h === 13) continue;
      const horaStr = h.toString().padStart(2, '0') + ':00';
      horas.push(horaStr);
    }
    return horas;
  }

  // Validación de campos requeridos (excepto notas)
  reservaValida(): boolean {
    return (
      !!this.reserva.servicio &&
      !!this.reserva.fecha &&
      !!this.reserva.hora &&
      !!this.reserva.marca &&
      !!this.reserva.modelo &&
      !!this.reserva.anio &&
      this.reserva.anio >= 1900 &&
      this.reserva.anio <= 2099 &&
      !!this.reserva.nombre &&
      !!this.reserva.ubicacion &&
      this.reserva.aceptaTerminos
    );
  }

  async guardarReserva() {
    if (!this.reservaValida()) {
      const toast = await this.toastController.create({
        message: 'Por favor, completa todos los campos requeridos.',
        duration: 2000,
        color: 'danger',
        position: 'bottom'
      });
      await toast.present();
      return;
    }
    // Obtiene la imagen seleccionada del localStorage, si existe
    const imagenSeleccionada = localStorage.getItem('servicioImagenSeleccionada') || '/assets/img/default-service.png';
    setTimeout(async () => {
      const itemReserva = {
        id: 'reserva-' + Date.now(),
        nombre: `Reserva: ${this.reserva.servicio}`,
        imagen: imagenSeleccionada,
        precio: this.reservaPrecio,
        detalles: {
          servicio: this.reserva.servicio,
          fecha: this.reserva.fecha,
          hora: this.reserva.hora,
          marca: this.reserva.marca,
          modelo: this.reserva.modelo,
          anio: this.reserva.anio,
          nombre: this.reserva.nombre,
          ubicacion: this.reserva.ubicacion,
          notas: this.reserva.notas
        }
      };
      this.cartService.addItem(itemReserva);
      const toast = await this.toastController.create({
        message: 'Reserva agregada al carrito. Puedes pagar desde el carrito.',
        duration: 2000,
        color: 'success',
        position: 'bottom'
      });
      await toast.present();
      this.router.navigate(['/carrito']);
    }, 500);
  }
}

