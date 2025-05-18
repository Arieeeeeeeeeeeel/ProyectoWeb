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
  // variable usada por *ngIf en el HTML
  modo: string = '';

  // método usado por los botones
  setModo(m: string) {
    this.modo = m;
    console.log('Modo cambiado a:', this.modo); // útil para debug
  }
}
