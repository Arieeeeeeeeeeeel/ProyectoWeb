import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService, UserProfile } from '../../services/auth.service'; // Importa UserProfile
import { NavController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs'; // Para manejar la suscripción
import { VehiculoService, Vehiculo } from '../../services/vehiculo.service';
import { VehiculoApiService } from '../../services/vehiculo-api.service';
import { UbicacionesService, DireccionUsuario } from '../../services/ubicaciones.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.page.html',
  styleUrls: ['./user-profile.page.scss'],
  standalone:false,
})
export class UserProfilePage implements OnInit, OnDestroy {
  currentUser: UserProfile | null = null; // Para almacenar los datos del usuario
  private userSubscription: Subscription | undefined;
  autos: Vehiculo[] = [];
  marcas: any[] = [];
  modelos: any[] = [];
  marcaSeleccionada: string = '';
  modeloSeleccionado: string = '';
  cargandoMarcas: boolean = false;
  showAddAutoForm: boolean = false;
  nuevoAuto: any = {
    marca: '',
    modelo: '',
    ano: null,
    patente: '',
    tipo_combustible: '',
    color: '',
    apodo: ''
  };
  ubicaciones: DireccionUsuario[] = [];
  showAddUbicacionForm: boolean = false;
  nuevaUbicacion: any = { calle: '', ciudad: '', codigoPostal: '', esPrincipal: false };

  constructor(
    private authService: AuthService,
    private navController: NavController,
    private toastController: ToastController,
    private vehiculoService: VehiculoService,
    private vehiculoApi: VehiculoApiService,
    private ubicacionesService: UbicacionesService // <--- INYECTAR SERVICIO
  ) {}

  ngOnInit() {
    // Suscribirse para obtener los datos del usuario actual
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (!user) {
        // Si el usuario deja de estar logueado, redirigir
        this.navController.navigateRoot('/home');
      }
    });
    this.cargarAutosUsuario();
    this.getMarcas();
    this.cargarUbicacionesUsuario();
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  // Función para ir a la página de edición
  goToEditProfile() {
    this.navController.navigateForward('/user-profile-edit');
  }

  async logout() {
    this.authService.logout();
    await this.presentToast('Sesión cerrada correctamente.', 'light');
    // La redirección a /home se maneja en el subscribe de ngOnInit si el usuario es null
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

  cargarAutosUsuario() {
    if (!this.currentUser) return;
    this.vehiculoService.getVehiculosUsuario(this.currentUser.personaid).subscribe({
      next: autos => this.autos = autos,
      error: () => this.autos = []
    });
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
    if (!this.marcaSeleccionada) return;
    this.vehiculoApi.getModelos(this.marcaSeleccionada).subscribe({
      next: (modelos) => this.modelos = modelos,
      error: () => this.modelos = []
    });
  }

  onModeloChange() {
    // No-op, pero puedes usar para lógica extra si quieres
  }

  mostrarFormularioAuto() {
    this.showAddAutoForm = true;
    this.nuevoAuto = {
      marca: '', modelo: '', ano: null, patente: '', tipo_combustible: '', color: '', apodo: ''
    };
    this.marcaSeleccionada = '';
    this.modeloSeleccionado = '';
    this.modelos = [];
  }

  cancelarAgregarAuto() {
    this.showAddAutoForm = false;
  }

  onMarcaChangeForm() {
    this.modeloSeleccionado = '';
    this.nuevoAuto.modelo = '';
    if (!this.marcaSeleccionada) {
      this.modelos = [];
      return;
    }
    this.vehiculoApi.getModelos(this.marcaSeleccionada).subscribe({
      next: (modelos) => this.modelos = modelos,
      error: () => this.modelos = []
    });
  }

  agregarAutoForm() {
    if (!this.marcaSeleccionada || !this.modeloSeleccionado || !this.nuevoAuto.ano || !this.nuevoAuto.patente || !this.nuevoAuto.tipo_combustible || !this.nuevoAuto.color) {
      this.presentToast('Completa todos los campos obligatorios', 'danger');
      return;
    }
    const data = {
      marca: this.marcaSeleccionada,
      modelo: this.modeloSeleccionado,
      ano: this.nuevoAuto.ano,
      patente: this.nuevoAuto.patente,
      tipo_combustible: this.nuevoAuto.tipo_combustible,
      color: this.nuevoAuto.color,
      apodo: this.nuevoAuto.apodo
    };
    this.vehiculoService.crearVehiculo(this.currentUser!.personaid, data).subscribe({
      next: () => {
        this.presentToast('Auto guardado', 'success');
        this.cargarAutosUsuario();
        this.showAddAutoForm = false;
      },
      error: () => this.presentToast('Error al guardar auto', 'danger')
    });
  }

  eliminarAuto(vehiculo_id: number) {
    this.vehiculoService.eliminarVehiculo(vehiculo_id).subscribe({
      next: () => {
        this.presentToast('Auto eliminado', 'warning');
        this.cargarAutosUsuario();
      },
      error: () => this.presentToast('Error al eliminar auto', 'danger')
    });
  }

  cargarUbicacionesUsuario() {
    this.ubicacionesService.getUserAddresses().subscribe({
      next: (direcciones) => {
        this.ubicaciones = direcciones;
      },
      error: () => {
        this.ubicaciones = [];
      }
    });
  }

  mostrarFormularioUbicacion() {
    this.showAddUbicacionForm = true;
    this.nuevaUbicacion = { calle: '', ciudad: '', codigoPostal: '', esPrincipal: false };
  }

  cancelarAgregarUbicacion() {
    this.showAddUbicacionForm = false;
  }

  agregarUbicacionForm() {
    if (!this.nuevaUbicacion.calle || !this.nuevaUbicacion.ciudad || !this.nuevaUbicacion.codigoPostal) {
      this.presentToast('Completa todos los campos de la dirección', 'danger');
      return;
    }
    this.ubicacionesService.addUserAddress({
      calle: this.nuevaUbicacion.calle,
      ciudad: this.nuevaUbicacion.ciudad,
      codigoPostal: this.nuevaUbicacion.codigoPostal,
      esPrincipal: this.nuevaUbicacion.esPrincipal
    }).subscribe({
      next: () => {
        this.presentToast('Dirección guardada', 'success');
        this.cargarUbicacionesUsuario();
        this.showAddUbicacionForm = false;
      },
      error: () => {
        this.presentToast('Error al guardar dirección', 'danger');
      }
    });
  }

  eliminarUbicacion(idx: number) {
    const direccion = this.ubicaciones[idx];
    if (!direccion || !direccion.id) return;
    this.ubicacionesService.deleteUserAddress(direccion.id).subscribe({
      next: () => {
        this.presentToast('Dirección eliminada', 'warning');
        this.cargarUbicacionesUsuario();
      },
      error: () => this.presentToast('Error al eliminar dirección', 'danger')
    });
  }

  guardarUbicacionesUsuario() {
    // Ya no se usa localStorage
  }

  goToPurchases() {
    this.navController.navigateForward('/user-purchases');
  }

  async abrirDialogoCambioContrasena() {
    const alert = document.createElement('ion-alert');
    alert.header = 'Cambiar Contraseña';
    alert.inputs = [
      {
        name: 'oldPassword',
        type: 'password',
        placeholder: 'Contraseña actual',
      },
      {
        name: 'newPassword',
        type: 'password',
        placeholder: 'Nueva contraseña',
      },
      {
        name: 'confirmPassword',
        type: 'password',
        placeholder: 'Confirmar nueva contraseña',
      }
    ];
    alert.buttons = [
      {
        text: 'Cancelar',
        role: 'cancel',
      },
      {
        text: 'Cambiar',
        handler: async (data) => {
          if (!data.oldPassword || !data.newPassword || !data.confirmPassword) {
            this.presentToast('Completa todos los campos.', 'danger');
            setTimeout(() => this.abrirDialogoCambioContrasena(), 500);
            return false;
          }
          if (data.newPassword !== data.confirmPassword) {
            this.presentToast('Las contraseñas no coinciden.', 'danger');
            setTimeout(() => this.abrirDialogoCambioContrasena(), 500);
            return false;
          }
          this.authService.changePassword(data.oldPassword, data.newPassword).subscribe({
            next: () => this.presentToast('Contraseña cambiada correctamente.', 'success'),
            error: (err) => {
              const msg = err?.error?.error || 'Error al cambiar la contraseña.';
              this.presentToast(msg, 'danger');
              setTimeout(() => this.abrirDialogoCambioContrasena(), 500);
            }
          });
          return true;
        }
      }
    ];
    document.body.appendChild(alert);
    await alert.present();
    await alert.onDidDismiss();
  }
}