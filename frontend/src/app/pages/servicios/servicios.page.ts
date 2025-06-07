import { Component, OnInit } from '@angular/core';

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
      link: '/home'
    },
    {
      src: '/assets/neumaticos.png',
      alt: 'Imagen promocional de auto 3',
      link: '/home'
    },
    {
      src: '/assets/domicilio.png',
      alt: 'Imagen promocional de auto 4',
      link: '/home'
    },
    {
      src: '/assets/mantenimiento.png',
      alt: 'Imagen promocional de auto 5',
      link: '/home'
    }
  ];
}