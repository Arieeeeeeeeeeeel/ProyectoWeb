import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // IMPORTANTE: Asegúrate de que esta línea esté presente

// Define la interfaz para tus productos (ajusta según tu API)
interface Producto {
  id: string;
  nombre: string;
  marca: string;
  modelo: string;
  anio: number;
  repuesto: string;
  imagen?: string;
  precio?: number;
  valoracion?: number;
}

@Component({
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
  standalone: false,
})
export class ProductosPage implements OnInit {

  searchFilters = {
    marca: '',
    modelo: '',
    anio: null as number | null,
    repuesto: ''
  };

  productos: Producto[] = [];
  currentSort: string = 'nuevo';
  hasSearched: boolean = false;

  constructor(
    private router: Router // IMPORTANTE: Inyecta el Router aquí en el constructor
  ) { }

  ngOnInit() { }

  async buscarProductos() {
    this.hasSearched = true;
    console.log('Buscando productos con filtros:', this.searchFilters);

    const productosSimulados: Producto[] = [
      { id: '1', nombre: 'MOBIL DELVAC SUPER 20W-50 B-4 LTS', marca: 'Mobil', modelo: 'Delval super 20w-50 B-4 LTS', anio: 2024, repuesto: 'Aceite', imagen: 'https://i.ibb.co/VMyhV6R/mobil.png', precio: 4500, valoracion: 4.5 },
      { id: '2', nombre: 'Filtro de Aire - Toyota Hilux', marca: 'Toyota', modelo: 'Hilux', anio: 2024, repuesto: 'Filtro', imagen: 'https://placehold.co/250x250/ADD8E6/000000?text=Filtro+Aire', precio: 12000, valoracion: 3.8 },
      { id: '3', nombre: 'Pastillas de Freno - Nissan Frontier', marca: 'Nissan', modelo: 'Frontier', anio: 2023, repuesto: 'Freno', imagen: 'https://placehold.co/250x250/90EE90/000000?text=Pastillas+Freno', precio: 10000, valoracion: 4.0 },
      { id: '4', nombre: 'Amortiguador Trasero - Toyota Corolla', marca: 'Toyota', modelo: 'Corolla', anio: 2022, repuesto: 'Amortiguador', imagen: 'https://placehold.co/250x250/FFB6C1/000000?text=Amortiguador', precio: 17000, valoracion: 4.2 },
    ];

    this.productos = productosSimulados.filter(p => {
      const marcaMatch = !this.searchFilters.marca || p.marca.toLowerCase().includes(this.searchFilters.marca.toLowerCase());
      const modeloMatch = !this.searchFilters.modelo || p.modelo.toLowerCase().includes(this.searchFilters.modelo.toLowerCase());
      const anioMatch = !this.searchFilters.anio || p.anio === this.searchFilters.anio;
      const repuestoMatch = !this.searchFilters.repuesto || p.repuesto.toLowerCase().includes(this.searchFilters.repuesto.toLowerCase());
      return marcaMatch && modeloMatch && anioMatch && repuestoMatch;
    });

    this.sortProducts();
  }

  aplicarFiltro(tipoFiltro: string) {
    this.currentSort = tipoFiltro;
    this.sortProducts();
  }

  private sortProducts() {
    switch (this.currentSort) {
      case 'nuevo':
        break;
      case 'precioAsc':
        this.productos.sort((a, b) => (a.precio || 0) - (b.precio || 0));
        break;
      case 'precioDesc':
        this.productos.sort((a, b) => (b.precio || 0) - (a.precio || 0));
        break;
      case 'valoracion':
        this.productos.sort((a, b) => (b.valoracion || 0) - (a.valoracion || 0));
        break;
    }
  }

  // MÉTODO CLAVE: Este método se encarga de la navegación
  verDetalleProducto(id: string) {
    console.log('Intentando navegar al detalle del producto con ID:', id);
    // Asegúrate de que la ruta aquí coincida exactamente con la definida en app-routing.module.ts
    // El primer elemento del array es la ruta base, y los siguientes son los parámetros de la ruta.
    this.router.navigate(['/pages/producto-detalle', id])
      .then(success => {
        if (success) {
          console.log('Navegación exitosa.');
        } else {
          console.warn('La navegación no fue exitosa. La URL podría ser inválida o no hubo coincidencia de ruta.');
        }
      })
      .catch(error => {
        console.error('Error durante la navegación:', error);
      });
  }

  trackByProductoId(index: number, producto: Producto): string {
    return producto.id;
  }
}
