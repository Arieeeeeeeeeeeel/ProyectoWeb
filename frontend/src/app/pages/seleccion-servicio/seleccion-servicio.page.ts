import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../../services/cart.service';
import { ToastController } from '@ionic/angular';
import { ReservaService } from '../../services/reserva.service';
import { AuthService } from '../../services/auth.service';
import { ServicioService } from '../../services/servicio.service';
import { VehiculoApiService } from '../../services/vehiculo-api.service';
import { VehiculoService, Vehiculo } from '../../services/vehiculo.service';

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
  horasOcupadas: string[] = [];
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

  autosUsuario: Vehiculo[] = [];
  autoSeleccionado: number | null = null;
  mostrarAutoManual: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cartService: CartService,
    private toastController: ToastController,
    private reservaService: ReservaService,
    private authService: AuthService,
    private servicioService: ServicioService,
    private vehiculoApi: VehiculoApiService,
    private vehiculoService: VehiculoService
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
    this.cargarAutosUsuario();
    // Autocompletar nombre solo si está vacío
    const user = this.authService.getCurrentUser();
    if (user && !this.reserva.nombre) {
      this.reservaService.obtenerNombreCompleto(user.rut).subscribe(res => {
        if (res && res.nombre_completo) {
          this.reserva.nombre = res.nombre_completo;
        }
      });
    }
    // Cargar horas ocupadas para la fecha actual
    this.onFechaChange();
  }

  onFechaChange() {
    if (!this.reserva.fecha || !this.reserva.servicio) {
      this.horasOcupadas = [];
      return;
    }
    const fecha = this.reserva.fecha.split('T')[0];
    // Obtener el servicio_id correspondiente al nombre seleccionado
    this.servicioService.getServicios().subscribe(servicios => {
      const servicio = servicios.find(s => s.nombre === this.reserva.servicio);
      if (!servicio) {
        this.horasOcupadas = [];
        return;
      }
      const servicioId = servicio.servicio_id;
      this.reservaService.getReservasPorFecha(fecha).subscribe({
        next: (reservas) => {
          this.horasOcupadas = reservas
            .filter(r => r.servicio == servicioId)
            .map(r => r.hora);
          if (this.reserva.hora && this.horasOcupadas.includes(this.reserva.hora)) {
            this.reserva.hora = '';
          }
        },
        error: () => {
          this.horasOcupadas = [];
        }
      });
    });
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
    this.reserva.fecha = '';
    this.reserva.hora = '';
    this.horasOcupadas = [];
    if (!this.reserva.servicio) {
      this.servicioPrecio = null;
      return;
    }
    this.servicioService.getServicios().subscribe(servicios => {
      const servicio = servicios.find(s => s.nombre === this.reserva.servicio);
      this.servicioPrecio = servicio ? servicio.precio : null;
    });
  }

  cargarAutosUsuario() {
    const user = this.authService.getCurrentUser();
    if (!user) return;
    this.vehiculoService.getVehiculosUsuario(user.personaid).subscribe({
      next: autos => this.autosUsuario = autos,
      error: () => this.autosUsuario = []
    });
  }

  onAutoSeleccionadoChange() {
    if (this.autoSeleccionado && this.autoSeleccionado !== -1) {
      const auto = this.autosUsuario.find(a => a.vehiculo_id === this.autoSeleccionado);
      if (auto) {
        this.reserva.marca = auto.marca;
        this.reserva.modelo = auto.modelo;
        this.reserva.anio = auto.ano;
        this.reserva.patente = auto.patente;
        this.marcaSeleccionada = auto.marca;
        this.modeloSeleccionado = auto.modelo;
        this.mostrarAutoManual = false;
      }
    } else {
      this.reserva.marca = '';
      this.reserva.modelo = '';
      this.reserva.anio = null;
      this.reserva.patente = '';
      this.marcaSeleccionada = '';
      this.modeloSeleccionado = '';
      this.mostrarAutoManual = true;
    }
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
    // Validar que el año sea un número válido
    if (!this.reserva.anio || isNaN(Number(this.reserva.anio))) {
      const toast = await this.toastController.create({
        message: 'El año del vehículo debe ser un número válido.',
        duration: 2000,
        color: 'danger',
        position: 'bottom'
      });
      await toast.present();
      return;
    }
    // Validar que la hora no esté ocupada
    if (this.horasOcupadas.includes(this.reserva.hora)) {
      const toast = await this.toastController.create({
        message: 'La hora seleccionada ya está ocupada. Elige otra.',
        duration: 2000,
        color: 'danger',
        position: 'bottom'
      });
      await toast.present();
      return;
    }
    this.reserva.anio = Number(this.reserva.anio); // Forzar a número
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
    // Si el usuario eligió un auto guardado, usar ese vehiculo_id directamente
    if (this.autoSeleccionado && this.autoSeleccionado !== -1) {
      const auto = this.autosUsuario.find(a => a.vehiculo_id === this.autoSeleccionado);
      if (!auto) return;
      this.servicioService.getServicios().subscribe(servicios => {
        const servicio = servicios.find(s => s.nombre === this.reserva.servicio);
        if (!servicio) return;
        const reservaPayload = {
          usuario_rut: user.rut,
          vehiculo_id: auto.vehiculo_id,
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
      });
      return;
    }
    // Antes de crear el auto, verificar si ya existe uno igual
    const yaExiste = this.autosUsuario.some(a =>
      a.marca === this.reserva.marca &&
      a.modelo === this.reserva.modelo &&
      a.ano === this.reserva.anio &&
      a.patente === this.reserva.patente
    );
    if (!yaExiste) {
      const alert = document.createElement('ion-alert');
      alert.header = '¿Guardar auto?';
      alert.message = '¿Deseas guardar este auto en tu perfil para futuras reservas?';
      alert.buttons = [
        {
          text: 'No',
          role: 'cancel',
          handler: () => this.guardarReservaManual(false)
        },
        {
          text: 'Sí',
          handler: () => this.guardarReservaManual(true)
        }
      ];
      document.body.appendChild(alert);
      await alert.present();
      await alert.onDidDismiss();
      return;
    }
    // Si ya existe, solo guardar la reserva
    this.guardarReservaManual(false);
  }

  guardarReservaManual(guardarAuto: boolean) {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.toastController.create({
        message: 'Debes iniciar sesión para reservar.',
        duration: 2000,
        color: 'danger',
        position: 'bottom'
      }).then(toast => toast.present());
      return;
    }
    // Validar que el año sea un número válido
    if (!this.reserva.anio || isNaN(Number(this.reserva.anio))) {
      this.toastController.create({
        message: 'El año del vehículo debe ser un número válido.',
        duration: 2000,
        color: 'danger',
        position: 'bottom'
      }).then(toast => toast.present());
      return;
    }
    // Validar que la hora no esté ocupada
    if (this.horasOcupadas.includes(this.reserva.hora)) {
      this.toastController.create({
        message: 'La hora seleccionada ya está ocupada. Elige otra.',
        duration: 2000,
        color: 'danger',
        position: 'bottom'
      }).then(toast => toast.present());
      return;
    }
    this.reserva.anio = Number(this.reserva.anio); // Forzar a número
    this.servicioService.getServicios().subscribe(servicios => {
      const servicio = servicios.find(s => s.nombre === this.reserva.servicio);
      if (!servicio) return;
      const crearReserva = (vehiculo_id: number) => {
        const reservaPayload = {
          usuario_rut: user.rut,
          vehiculo_id,
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
      };
      if (guardarAuto) {
        const vehiculoPayload = {
          marca: this.reserva.marca,
          modelo: this.reserva.modelo,
          ano: typeof this.reserva.anio === 'number' ? this.reserva.anio : undefined,
          patente: this.reserva.patente,
          tipo_combustible: 'Desconocido',
          color: 'Desconocido',
          apodo: ''
        };
        this.vehiculoService.crearVehiculo(user.personaid, vehiculoPayload).subscribe({
          next: (vehiculoRes) => crearReserva(vehiculoRes.vehiculo_id),
          error: async () => {
            const toast = await this.toastController.create({
              message: 'Error al guardar el auto.',
              duration: 2000,
              color: 'danger',
              position: 'bottom'
            });
            await toast.present();
          }
        });
      } else {
        // Crear auto temporal solo para la reserva
        const vehiculoPayload = {
          marca: this.reserva.marca,
          modelo: this.reserva.modelo,
          ano: typeof this.reserva.anio === 'number' ? this.reserva.anio : undefined,
          patente: this.reserva.patente,
          tipo_combustible: 'Desconocido',
          color: 'Desconocido',
          apodo: ''
        };
        this.vehiculoService.crearVehiculo(user.personaid, vehiculoPayload).subscribe({
          next: (vehiculoRes) => crearReserva(vehiculoRes.vehiculo_id),
          error: async () => {
            const toast = await this.toastController.create({
              message: 'Error al crear el vehículo.',
              duration: 2000,
              color: 'danger',
              position: 'bottom'
            });
            await toast.present();
          }
        });
      }
    });
  }
}

