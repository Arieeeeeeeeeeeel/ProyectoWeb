import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-servicios',
  templateUrl: './servicios.page.html',
  styleUrls: ['./servicios.page.scss'],
  standalone:false
})

export class ServiciosPage {
  imagenes = [
    {
      src: '/assets/diagnostico.png',
      alt: 'Imagen promocional de auto 1',
      link: '/seleccion-servicio'
    },
    {
      src: '/assets/desabolladura.png',
      alt: 'Imagen promocional de auto 2',
      link: '/seleccion-servicio'
    },
    {
      src: '/assets/neumaticos.png',
      alt: 'Imagen promocional de auto 3',
      link: '/seleccion-servicio'
    },
    {
      src: '/assets/domicilio.png',
      alt: 'Imagen promocional de auto 4',
      link: '/seleccion-servicio'
    },
    {
      src: '/assets/mantenimiento.png',
      alt: 'Imagen promocional de auto 5',
      link: '/seleccion-servicio'
    }
  ];

  constructor(private router: Router) {}

  seleccionarServicio(servicio: string) {
    this.router.navigate(['/seleccion-servicio'], { queryParams: { servicio } });
  }

  getServicioPorIndice(i: number): string {
    const servicios = [
      'Diagnóstico',
      'Desabolladura y pintura',
      'Cambio neumático',
      'Mecánico a domicilio',
      'Mantenimiento'
    ];
    return servicios[i] || '';
  }
}