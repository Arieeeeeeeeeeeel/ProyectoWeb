import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
  standalone:false
})
export class ProductosPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  productos = [
    { nombre: 'Producto 1' },
    { nombre: 'Producto 2' },
    { nombre: 'Producto 3' },
    { nombre: 'Producto 4' },
    { nombre: 'Producto 5' },
    { nombre: 'Producto 6' },
    { nombre: 'Producto 7' },
    { nombre: 'Producto 8' },
    { nombre: 'Producto 9' },
  ];
}
