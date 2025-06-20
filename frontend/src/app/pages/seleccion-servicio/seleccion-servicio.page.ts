import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../../services/cart.service';
import { ToastController } from '@ionic/angular';
import { ReservaService } from '../../services/reserva.service';
import { AuthService } from '../../services/auth.service';
import { ServicioService } from '../../services/servicio.service';
import { VehiculoApiService } from '../../services/vehiculo-api.service';

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
export class SeleccionPage implements OnInit {
  minDate: string;
  horasDisponibles: string[] = [];
  reservaPrecio: number = 50000;
  domicilio: string = '';

  marcas: any[] = [];
  modelos: any[] = [];
  marcaSeleccionada: string = '';
  modeloSeleccionado: string = '';
  cargandoMarcas: boolean = false;

  reserva = {
    servicio: '',
    fecha: '',
    hora: '',
    marca: '',
    modelo: '',
    anio: null as number | null,
    patente: '',
    nombre: '',
    ubicacion: '',
    aceptaTerminos: false,
    notas: ''
  };

  servicioPrecio: number|null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cartService: CartService,
    private toastController: ToastController,
    private reservaService: ReservaService,
    private authService: AuthService,
    private servicioService: ServicioService,
    private vehiculoApi: VehiculoApiService
  ) {
    this.route.queryParams.subscribe(params => {
      if (params['servicio']) {
        this.reserva.servicio = params['servicio'];
        this.onServicioChange(); // Mostrar precio automáticamente si viene por query
      }
    });
    this.minDate = this.getToday();
    this.horasDisponibles = this.generarHorasDisponibles();
  }

  ngOnInit() {
    this.getMarcas();
    // Autocompletar nombre solo si está vacío
    const user = this.authService.getCurrentUser();
    if (user && !this.reserva.nombre) {
      this.reservaService.obtenerNombreCompleto(user.rut).subscribe(res => {
        if (res && res.nombre_completo) {
          this.reserva.nombre = res.nombre_completo;
        }
      });
    }
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

  getMarcas() {
    this.cargandoMarcas = true;
    this.vehiculoApi.getMarcas().subscribe({
      next: (marcas) => {
        this.marcas = marcas;
        this.cargandoMarcas = false;
      },
      error: () => {
        this.cargandoMarcas = false;
      }
    });
  }

  onMarcaChange() {
    this.modelos = [];
    this.modeloSeleccionado = '';
    this.reserva.marca = this.marcaSeleccionada; // Sincroniza
    if (!this.marcaSeleccionada) return;
    this.http.get<any>(`https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformake/${this.marcaSeleccionada}?format=json`)
      .subscribe(res => {
        this.modelos = res.Results;
      });
  }

  onModeloChange() {
    this.reserva.modelo = this.modeloSeleccionado; // Sincroniza
  }

  onServicioChange() {
    if (!this.reserva.servicio) {
      this.servicioPrecio = null;
      return;
    }
    this.servicioService.getServicios().subscribe(servicios => {
      const servicio = servicios.find(s => s.nombre === this.reserva.servicio);
      this.servicioPrecio = servicio ? servicio.precio : null;
    });
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
    if (this.reserva.servicio === 'MECANICO A DOMICILIO' && !this.domicilio) {
      const toast = await this.toastController.create({
        message: 'Debes ingresar el domicilio para el servicio a domicilio.',
        duration: 2000,
        color: 'danger',
        position: 'bottom'
      });
      await toast.present();
      return;
    }
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
    this.servicioService.getServicios().subscribe(servicios => {
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
            fecha_reserva: `${this.reserva.fecha.split('T')[0]}T${this.reserva.hora}:00`,
            ubicacion: this.reserva.servicio === 'MECANICO A DOMICILIO' ? this.domicilio : this.reserva.ubicacion,
            notas: this.reserva.notas,
            estado: 'pendiente',
            nombre_completo: this.reserva.nombre
          };
          this.reservaService.crearReserva(reservaPayload).subscribe({
            next: async (response) => {
              const toast = await this.toastController.create({
                message: 'Reserva creada exitosamente.',
                duration: 2000,
                color: 'success',
                position: 'bottom'
              });
              await toast.present();
              // Limpiar formulario si quieres
              // this.router.navigate(['/alguna-pagina']);
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

