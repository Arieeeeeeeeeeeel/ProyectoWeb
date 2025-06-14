import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; // <-- Agrega Router
import { HttpClient } from '@angular/common/http';
import { CartService } from '../../services/cart.service'; // Ajusta la ruta si es necesario
import { ToastController } from '@ionic/angular'; // <-- Agrega ToastController

export interface CartItem {
  id: string;
  nombre: string;
  imagen?: string;
  precio: number;
  stock?: number; // Hacer stock opcional para reservas
  detalles?: any; // Permitir detalles adicionales
}

@Component({
  selector: 'app-seleccion-servicio',
  templateUrl: './seleccion-servicio.page.html',
  styleUrls: ['./seleccion-servicio.page.scss'],
  standalone:false,
  
})
export class SeleccionPage {
  minDate: string;
  horasDisponibles: string[] = [];
  reservaPrecio: number = 50000; // Puedes ajustar este valor o cargarlo dinámicamente

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
    private router: Router, // <-- Agrega Router
    private toastController: ToastController // <-- Agrega ToastController
  ) {
    // Leer el parámetro 'servicio' si existe y preseleccionarlo
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
    // Formato YYYY-MM-DD
    return today.toISOString().split('T')[0];
  }

  generarHorasDisponibles(): string[] {
    const horas: string[] = [];
    for (let h = 9; h <= 20; h++) {
      if (h === 13) continue; // Saltar hora de almuerzo
      const horaStr = h.toString().padStart(2, '0') + ':00';
      horas.push(horaStr);
    }
    return horas;
  }

  async guardarReserva() {
    if (this.reserva.aceptaTerminos) {
      const reservaPayload = {
        ...this.reserva
      };
      this.http.post('https://tu-backend.com/api/reservas', reservaPayload)
        .subscribe({
          next: async (resp) => {
            console.log('Reserva guardada en backend:', resp);
            // Agregar la reserva al carrito (asegúrate de que el objeto cumple con la interfaz CartItem)
            const itemReserva = {
              id: 'reserva-' + Date.now(),
              nombre: `Reserva: ${this.reserva.servicio}`,
              imagen: '/assets/img/default-service.png',
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
            const agregado = this.cartService.addItem(itemReserva);
            console.log('Reserva agregada al carrito:', agregado, itemReserva, this.cartService['_cartItems']?.getValue?.());
            // Muestra un mensaje de éxito y redirige al carrito
            const toast = await this.toastController.create({
              message: 'Reserva agregada al carrito. Puedes pagar desde el carrito.',
              duration: 2000,
              color: 'success',
              position: 'bottom'
            });
            await toast.present();
            this.router.navigate(['/carrito']);
          },
          error: (err) => {
            console.error('Error al guardar reserva:', err);
            // Aquí puedes mostrar un mensaje de error
          }
        });
    }
  }
}
