import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { ToastController, NavController } from '@ionic/angular';
import { AuthService, UserProfile } from '../../services/auth.service';

interface Region {
  nombre: string;
  comunas: string[];
}

@Component({
  selector: 'app-registrar',
  templateUrl: './registrar.page.html',
  styleUrls: ['./registrar.page.scss'],
  standalone:false,
})
export class RegistrarPage implements OnInit {
  registerForm: FormGroup;
  regiones: Region[] = [
    // ... tus datos de regiones ...
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

  constructor(
    private fb: FormBuilder,
    private toastController: ToastController,
    private navController: NavController,
    private authService: AuthService 
  ) {
    this.registerForm = this.fb.group({
      usuario: ['', [Validators.required, Validators.minLength(3)]],
      rut: ['', [Validators.required, Validators.pattern(/^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9Kk]$/)]],
      correo: ['', [Validators.required, Validators.email]],
      region: ['', Validators.required],
      comuna: ['', Validators.required],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      confirmarContrasena: ['', Validators.required],
      terminos: [false, Validators.requiredTrue]
    }, {
      validator: this.passwordMatchValidator
    });
  }

  ngOnInit() {
    this.registerForm.get('comuna')?.disable();
  }

  passwordMatchValidator: ValidatorFn = (control: AbstractControl): { [key: string]: boolean } | null => {
    const contrasena = control.get('contrasena');
    const confirmarContrasena = control.get('confirmarContrasena');

    if (contrasena && confirmarContrasena && contrasena.value !== confirmarContrasena.value) {
      confirmarContrasena.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else if (confirmarContrasena && confirmarContrasena.hasError('passwordMismatch')) {
      confirmarContrasena.setErrors(null);
    }
    return null;
  };

  formatRut() {
    let rut = this.registerForm.get('rut')?.value;
    if (rut) {
      rut = rut.replace(/[^0-9kK]/g, '');
      if (rut.length > 1) {
        let dv = rut.slice(-1);
        let cuerpo = rut.slice(0, -1);
        cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        this.registerForm.get('rut')?.setValue(`${cuerpo}-${dv.toUpperCase()}`, { emitEvent: false });
      } else {
         this.registerForm.get('rut')?.setValue(rut.toUpperCase(), { emitEvent: false });
      }
    }
  }

  onRegionChange() {
    const selectedRegionName = this.registerForm.get('region')?.value;
    const region = this.regiones.find(r => r.nombre === selectedRegionName);
    this.comunas = region ? region.comunas : [];
    this.registerForm.get('comuna')?.setValue('');
    if (this.comunas.length > 0) {
      this.registerForm.get('comuna')?.enable();
    } else {
      this.registerForm.get('comuna')?.disable();
    }
  }

  async onSubmit() {
    this.registerForm.markAllAsTouched();
    if (!this.registerForm.valid) {
      return this.presentToast('Por favor, completa todos los campos correctamente.', 'danger');
    }
    const { usuario, rut, correo, region, comuna, contrasena } = this.registerForm.value;
    this.authService.registerUser({ usuario, rut, correo, region, comuna, contrasena })
      .subscribe({
        next: async (user: UserProfile) => {
          await this.presentToast('¡Registro exitoso! Bienvenido, ' + user.usuario, 'success');
          this.navController.navigateRoot('/user-profile');
        },
        error: async err => {
          console.error(err);
          const msg = err.error?.error || 'Hubo un problema en el registro.';
          await this.presentToast(`Error: ${msg}`, 'danger');
        }
      });
  }

  async showTermsAndConditions(event: Event) {
    event.preventDefault();
    const toast = await this.toastController.create({
      message: 'jaja acepta no más mi washx, confia',
      duration: 5000,
      color: 'light',
      position: 'middle',
    });
    toast.present();
  }

  private async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({ message, duration: 3000, color, position: 'bottom' });
    toast.present();
  }
}