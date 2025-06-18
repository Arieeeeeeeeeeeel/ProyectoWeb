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
    // Busca la imagen correspondiente al servicio seleccionado
    const index = this.getServicioPorIndiceNombre(servicio);
    const imagenSeleccionada = this.imagenes[index]?.src || '/assets/img/default-service.png';
    localStorage.setItem('servicioImagenSeleccionada', imagenSeleccionada);
    this.router.navigate(['/seleccion-servicio'], { queryParams: { servicio } });
  }

  getServicioPorIndice(i: number): string {
    const servicios = [
      'SERVICIO DE DIAGNOSTICO',
      'DESABOLLADURA Y PINTURA',
      'CAMBIO DE NEUMATICOS',
      'MECANICO A DOMICILIO',
      'SERVICIO DE MANTENIMIENTO'
    ];
    return servicios[i] || '';
  }

  // Nuevo método para obtener el índice por nombre de servicio
  getServicioPorIndiceNombre(servicio: string): number {
    const servicios = [
      'SERVICIO DE DIAGNOSTICO',
      'DESABOLLADURA Y PINTURA',
      'CAMBIO DE NEUMATICOS',
      'MECANICO A DOMICILIO',
      'SERVICIO DE MANTENIMIENTO'
    ];
    return servicios.findIndex(s => s === servicio);
  }
}