// src/app/user-profile-edit/user-profile-edit.page.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { NavController, ToastController } from '@ionic/angular';
import { AuthService, UserProfile } from '../../services/auth.service'; // Importa UserProfile
import { Subscription } from 'rxjs';

// Define las regiones y comunas (copia del registrar.page.ts)
interface Region {
  nombre: string;
  comunas: string[];
}

@Component({
  selector: 'app-user-profile-edit',
  templateUrl: './user-profile-edit.page.html',
  styleUrls: ['./user-profile-edit.page.scss'],
  standalone:false,
})
export class UserProfileEditPage implements OnInit, OnDestroy {
  editProfileForm: FormGroup;
  currentUser: UserProfile | null = null;
  private userSubscription: Subscription | undefined;

  // Datos de regiones y comunas (copia del registrar.page.ts)
  regiones: Region[] = [
    { nombre: 'Arica y Parinacota', comunas: ['Arica', 'Camarones', 'Putre', 'General Lagos'] },
    { nombre: 'Tarapacá', comunas: ['Iquique', 'Alto Hospicio', 'Pozo Almonte', 'Pica', 'Huara', 'Colchane', 'Camiña'] },
    { nombre: 'Antofagasta', comunas: ['Antofagasta', 'Mejillones', 'Sierra Gorda', 'Taltal', 'Calama', 'Ollagüe', 'San Pedro de Atacama', 'Tocopilla', 'María Elena'] },
    { nombre: 'Atacama', comunas: ['Copiapó', 'Caldera', 'Tierra Amarilla', 'Chañaral', 'Diego de Almagro', 'Vallenar', 'Alto del Carmen', 'Freirina', 'Huasco'] },
    { nombre: 'Coquimbo', comunas: ['La Serena', 'Coquimbo', 'Andacollo', 'La Higuera', 'Paiguano', 'Vicuña', 'Ovalle', 'Combarbalá', 'Monte Patria', 'Punitaqui', 'Río Hurtado', 'Illapel', 'Canela', 'Los Vilos', 'Salamanca'] },
    { nombre: 'Valparaíso', comunas: ['Valparaíso', 'Casablanca', 'Concón', 'Juan Fernández', 'Puchuncaví', 'Quintero', 'Viña del Mar', 'Isla de Pascua', 'Quilpué', 'Limache', 'Olmué', 'Villa Alemana', 'Los Andes', 'Calle Larga', 'Catemu', 'Llay-Llay', 'Panquehue', 'Putaendo', 'San Esteban', 'San Felipe', 'Santa María', 'Petorca', 'Cabildo', 'La Ligua', 'Papudo', 'Zapallar', 'San Antonio', 'Algarrobo', 'Cartagena', 'El Quisco', 'El Tabo', 'Santo Domingo'] },
    { nombre: 'Metropolitana de Santiago', comunas: ['Santiago', 'Cerrillos', 'Cerro Navia', 'Conchalí', 'El Bosque', 'Estación Central', 'Huechuraba', 'Independencia', 'La Cisterna', 'La Florida', 'La Granja', 'La Pintana', 'La Reina', 'Las Condes', 'Lo Barnechea', 'Lo Espejo', 'Lo Prado', 'Macul', 'Maipú', 'Ñuñoa', 'Pedro Aguirre Cerda', 'Peñalolén', 'Providencia', 'Pudahuel', 'Quilicura', 'Quinta Normal', 'Recoleta', 'Renca', 'San Joaquín', 'San Miguel', 'San Ramón', 'Vitacura', 'Puente Alto', 'Pirque', 'San José de Maipo', 'Colina', 'Lampa', 'Til Til', 'San Bernardo', 'Buin', 'Calera de Tango', 'Paine', 'Melipilla', 'Alhué', 'Curacaví', 'María Pinto', 'San Pedro', 'Talagante', 'El Monte', 'Isla de Maipo', 'Padre Hurtado', 'Peñaflor'] },
    { nombre: 'O’Higgins', comunas: ['Rancagua', 'Codegua', 'Coinco', 'Coltauco', 'Doñihue', 'Graneros', 'Las Cabras', 'Machalí', 'Malloa', 'Mostazal', 'Olivar', 'Peumo', 'Pichidegua', 'Quinta de Tilcoco', 'Rengo', 'Requínoa', 'San Vicente de Tagua Tagua', 'Pichilemu', 'La Estrella', 'Litueche', 'Marchigüe', 'Navidad', 'Paredones', 'San Fernando', 'Chépica', 'Chimbarongo', 'Lolol', 'Nancagua', 'Palmilla', 'Peralillo', 'Placilla', 'Pumanque', 'Santa Cruz'] },
    { nombre: 'Maule', comunas: ['Talca', 'Constitución', 'Curepto', 'Empedrado', 'Maule', 'Pelarco', 'Pencahue', 'Río Claro', 'San Clemente', 'San Rafael', 'Cauquenes', 'Chanco', 'Pelluhue', 'Curicó', 'Hualañé', 'Licantén', 'Molina', 'Rauco', 'Romeral', 'Sagrada Familia', 'Teno', 'Vichuquén', 'Linares', 'Colbún', 'Longaví', 'Parral', 'Retiro', 'San Javier', 'Villa Alegre', 'Yerbas Buenas'] },
    { nombre: 'Ñuble', comunas: ['Chillán', 'Bulnes', 'Cobquecura', 'Coelemu', 'Coihueco', 'Chillán Viejo', 'El Carmen', 'Ninhue', 'Ñiquén', 'Pemuco', 'Pinto', 'Portezuelo', 'Quillón', 'Quirihue', 'Ránquil', 'San Carlos', 'San Fabián', 'San Ignacio', 'San Nicolás', 'Treguaco', 'Yungay'] },
    { nombre: 'Biobío', comunas: ['Concepción', 'Coronel', 'Chiguayante', 'Florida', 'Hualqui', 'Lota', 'Penco', 'San Pedro de la Paz', 'Santa Juana', 'Talcahuano', 'Tomé', 'Hualpén', 'Lebu', 'Arauco', 'Cañete', 'Contulmo', 'Curanilahue', 'Los Álamos', 'Tirúa', 'Los Ángeles', 'Antuco', 'Cabrero', 'Laja', 'Mulchén', 'Nacimiento', 'Negrete', 'Quilaco', 'Quilleco', 'San Rosendo', 'Santa Bárbara', 'Tucapel', 'Yumbel', 'Alto Biobío'] },
    { nombre: 'La Araucanía', comunas: ['Temuco', 'Carahue', 'Cunco', 'Curarrehue', 'Freire', 'Galvarino', 'Gorbea', 'Lautaro', 'Loncoche', 'Melipeuco', 'Nueva Imperial', 'Padre Las Casas', 'Perquenco', 'Pitrufquén', 'Pucón', 'Saavedra', 'Teodoro Schmidt', 'Toltén', 'Vilcún', 'Villarrica', 'Cholchol', 'Angol', 'Collipulli', 'Curacautín', 'Ercilla', 'Lonquimay', 'Los Sauces', 'Lumaco', 'Purén', 'Renaico', 'Traiguén', 'Victoria'] },
    { nombre: 'Los Ríos', comunas: ['Valdivia', 'Corral', 'Lanco', 'Los Lagos', 'Máfil', 'Mariquina', 'Paillaco', 'Panguipulli', 'La Unión', 'Futrono', 'Lago Ranco', 'Río Bueno'] },
    { nombre: 'Los Lagos', comunas: ['Puerto Montt', 'Calbuco', 'Cochamó', 'Fresia', 'Frutillar', 'Los Muermos', 'Llanquihue', 'Maullín', 'Puerto Varas', 'Castro', 'Ancud', 'Chonchi', 'Curaco de Vélez', 'Dalcahue', 'Queilén', 'Quellón', 'Quemchi', 'Quinchao', 'Osorno', 'Puerto Octay', 'Purranque', 'Puyehue', 'Río Negro', 'San Juan de la Costa', 'San Pablo', 'Chaitén', 'Futaleufú', 'Hualaihué', 'Palena'] },
    { nombre: 'Aysén del Gral. Carlos Ibáñez del Campo', comunas: ['Coyhaique', 'Lago Verde', 'Aysén', 'Cisnes', 'Guaitecas', 'Chile Chico', 'Río Ibáñez', 'Cochrane', 'O’Higgins', 'Tortel'] },
    { nombre: 'Magallanes y la Antártica Chilena', comunas: ['Punta Arenas', 'Laguna Blanca', 'Puerto Natales', 'Torres del Paine', 'Porvenir', 'Primavera', 'Timaukel', 'Cabo de Hornos', 'Antártica'] }
  ];
  comunas: string[] = [];
  // Asegúrate de tener la misma lista que en registrar.page.ts

  constructor(
    private fb: FormBuilder,
    private navController: NavController,
    private authService: AuthService,
    private toastController: ToastController
  ) {
    // Inicializar el formulario con los mismos campos que el de registro
    this.editProfileForm = this.fb.group({
      usuario: ['', [Validators.required, Validators.minLength(3)]],
      rut: ['', [Validators.required, Validators.pattern(/^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9Kk]$/)]],
      correo: ['', [Validators.required, Validators.email]], // Usar 'email' consistentemente
      region: ['', Validators.required],
      comuna: ['', Validators.required],
      // La contraseña y confirmación no las incluimos aquí para una edición simple
      // Si el usuario quiere cambiar la contraseña, debería ser un flujo separado.
    });
  }

  ngOnInit() {
    // Suscribirse para obtener los datos del usuario actual y rellenar el formulario
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (this.currentUser) {
        // Rellenar el formulario con los datos actuales del usuario
        this.editProfileForm.patchValue({
          usuario: this.currentUser.usuario,
          rut: this.currentUser.rut,
          correo: this.currentUser.correo,
          region: this.currentUser.region,
          comuna: this.currentUser.comuna,
        });
        // Asegurarse de que las comunas se carguen correctamente al precargar la región
        this.onRegionChange();
      } else {
        // Si no hay usuario, redirigir
        this.navController.navigateRoot('/home');
      }
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  formatRut() {
    let rut = this.editProfileForm.get('rut')?.value;
    if (rut) {
      rut = rut.replace(/[^0-9kK]/g, '');
      if (rut.length > 1) {
        let dv = rut.slice(-1);
        let cuerpo = rut.slice(0, -1);
        cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        this.editProfileForm.get('rut')?.setValue(`${cuerpo}-${dv.toUpperCase()}`, { emitEvent: false });
      } else {
         this.editProfileForm.get('rut')?.setValue(rut.toUpperCase(), { emitEvent: false });
      }
    }
  }

  onRegionChange() {
    const selectedRegionName = this.editProfileForm.get('region')?.value;
    const region = this.regiones.find(r => r.nombre === selectedRegionName);
    this.comunas = region ? region.comunas : [];
    // No reseteamos la comuna si ya hay una y es válida para la nueva región
    if (this.comunas.length > 0) {
      this.editProfileForm.get('comuna')?.enable();
    } else {
      this.editProfileForm.get('comuna')?.disable();
      this.editProfileForm.get('comuna')?.setValue(''); // Limpia si no hay comunas
    }
  }

  async onSubmit() {
    this.editProfileForm.markAllAsTouched();

    if (this.editProfileForm.valid && this.currentUser) {
      // Crear un objeto UserProfile actualizado, manteniendo la contraseña original
      const payload = {
        usuario: this.editProfileForm.value.usuario.trim(),
        correo: this.editProfileForm.value.correo.trim().toLowerCase(),
        region: this.editProfileForm.value.region,
        comuna: this.editProfileForm.value.comuna
      };

      this.authService.updateUserProfile(this.currentUser.personaid, payload)
      .subscribe({
        next: async user => {
          await this.presentToast('Perfil actualizado exitosamente!', 'success');
          this.navController.navigateBack('/user-profile');
        },
        error: async err => {
          await this.presentToast('Error al actualizar el perfil.', 'danger');
        }
      });
    } else {
      await this.presentToast('Por favor, completa todos los campos correctamente.', 'danger');
    }
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
}