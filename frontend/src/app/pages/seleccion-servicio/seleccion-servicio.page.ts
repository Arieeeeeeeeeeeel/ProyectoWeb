import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../../services/cart.service';
import { ToastController } from '@ionic/angular';
import { ReservaService } from '../../services/reserva.service';
import { AuthService } from '../../services/auth.service';
import { ServicioService } from '../../services/servicio.service';

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
    private router: Router,
    private http: HttpClient,
    private cartService: CartService,
    private toastController: ToastController,
    private reservaService: ReservaService,
    private authService: AuthService,
    private servicioService: ServicioService
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
    const imagenSeleccionada = localStorage.getItem('servicioImagenSeleccionada') || '/assets/img/default-service.png';
    const user = this.authService.getCurrentUser();
    if (!user) {
      const toast = await this.toastController.create({
        message: 'Debes iniciar sesión para reservar.',
        duration: 2000,
        color: 'danger',
        position: 'bottom'
      });
      await toast.present();
      return;
    }
    // Obtener el servicio_id según el nombre seleccionado
    this.servicioService.getServicios().subscribe(servicios => {
      console.log('Valor de this.reserva.servicio:', this.reserva.servicio); // <-- Debug
      const servicio = servicios.find(s => s.nombre === this.reserva.servicio);
      if (!servicio) {
        this.toastController.create({
          message: 'Servicio no encontrado.',
          duration: 2000,
          color: 'danger',
          position: 'bottom'
        }).then(t => t.present());
        return;
      }
      // Crear vehículo en backend (siempre, para obtener vehiculo_id)
      const vehiculoPayload = {
        marca: this.reserva.marca,
        modelo: this.reserva.modelo,
        ano: this.reserva.anio,
        patente: 'TEMP-' + Date.now(),
        tipo_combustible: 'Desconocido',
        color: 'Desconocido',
        apodo: ''
      };
      this.http.post<any>(`http://localhost:5000/vehicles/${user.personaid}/new_car`, vehiculoPayload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      }).subscribe({
        next: (vehiculoRes) => {
          const reservaPayload = {
            usuario_rut: user.rut,
            vehiculo_id: vehiculoRes.vehiculo_id,
            servicio_id: servicio.servicio_id,
            fecha_reserva: `${this.reserva.fecha.split('T')[0]}T${this.reserva.hora}:00`, // <-- Siempre formato correcto
            ubicacion: this.reserva.ubicacion,
            notas: this.reserva.notas,
            estado: 'pendiente'
          };
          this.reservaService.crearReserva(reservaPayload).subscribe({
            next: async (response) => {
              const itemReserva = {
                id: 'reserva-' + Date.now(),
                nombre: `Reserva: ${this.reserva.servicio}`,
                imagen: imagenSeleccionada,
                precio: this.reservaPrecio,
                detalles: {
                  ...reservaPayload,
                  nombre: this.reserva.nombre
                }
              };
              this.cartService.addItem(itemReserva);
              const toast = await this.toastController.create({
                message: 'Reserva creada y agregada al carrito. Puedes pagar desde el carrito.',
                duration: 2000,
                color: 'success',
                position: 'bottom'
              });
              await toast.present();
              this.router.navigate(['/carrito']);
            },
            error: async (err) => {
              const toast = await this.toastController.create({
                message: 'Error al crear la reserva. Intenta nuevamente.',
                duration: 2000,
                color: 'danger',
                position: 'bottom'
              });
              await toast.present();
            }
          });
        },
        error: async (err) => {
          const toast = await this.toastController.create({
            message: 'Error al crear el vehículo. Intenta nuevamente.',
            duration: 2000,
            color: 'danger',
            position: 'bottom'
          });
          await toast.present();
        }
      });
    });
  }
}

