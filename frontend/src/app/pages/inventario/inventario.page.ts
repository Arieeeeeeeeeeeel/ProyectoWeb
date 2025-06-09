import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.page.html',
  styleUrls: ['./inventario.page.scss'],
  standalone: false,
})
export class InventarioPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  modo: string = '';

  setModo(m: string) {
    this.modo = m;
    console.log('Modo cambiado a:', this.modo); 
  }
}
