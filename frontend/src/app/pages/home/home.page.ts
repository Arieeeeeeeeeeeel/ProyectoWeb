import { Component, OnInit } from '@angular/core';
import { ProductosService, Producto } from '../../services/productos.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone:false
})
export class HomePage implements OnInit {
  productosDestacados: Producto[] = [];
  hoveredIndex: number | null = null;

  constructor(
    private productosService: ProductosService,
    private router: Router
  ) { }

  ngOnInit() {
    this.productosService.getProductos().subscribe(productos => {
      this.productosDestacados = productos.filter(p => p.mostrar_en_inicio);
    });
  }

  setHovered(index: number | null) {
    this.hoveredIndex = index;
  }

  verDetalleProducto(id: number) {
    this.router.navigate(['/producto-detalle', id]);
  }
}
