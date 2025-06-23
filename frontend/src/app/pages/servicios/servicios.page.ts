import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ServicioService } from '../../services/servicio.service';

@Component({
  selector: 'app-servicios',
  templateUrl: './servicios.page.html',
  styleUrls: ['./servicios.page.scss'],
  standalone:false
})

export class ServiciosPage implements OnInit {
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

  servicios: any[] = [];
  precioSeleccionado: number|null = null;
  servicioSeleccionado: string = '';

  constructor(private router: Router, private servicioService: ServicioService) {}

  ngOnInit() {
    this.servicioService.getServicios().subscribe(servicios => {
      this.servicios = servicios;
    });
  }

  seleccionarServicio(servicio: string) {
    // Busca la imagen correspondiente al servicio seleccionado
    const index = this.getServicioPorIndiceNombre(servicio);
    const imagenSeleccionada = this.imagenes[index]?.src || '/assets/img/default-service.png';
    localStorage.setItem('servicioImagenSeleccionada', imagenSeleccionada);
    this.router.navigate(['/seleccion-servicio'], { queryParams: { servicio } });
  }

  mostrarPrecio(servicio: string) {
    const s = this.servicios.find(x => x.nombre === servicio);
    this.precioSeleccionado = s ? s.precio : null;
    this.servicioSeleccionado = servicio;
  }

  ocultarPrecio() {
    this.precioSeleccionado = null;
    this.servicioSeleccionado = '';
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