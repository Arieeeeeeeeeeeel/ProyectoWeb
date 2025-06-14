import { Component, OnInit } from '@angular/core';

interface Producto {
  id: string;
  nombre: string;
  marca: string;
  modelo: string;
  anio: number;
  repuesto: string;
  imagen?: string;
  precio: number;
  stock: number;
  esNuevo?: boolean;
  enOferta?: boolean;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone:false
})
export class HomePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  productos: Producto[] = [
    { id: '1', nombre: 'MOBIL DELVAC SUPER 20W-50 B-4 LTS', marca: 'Mobil', modelo: 'Delval super 20w-50 B-4 LTS', anio: 2024, repuesto: 'Aceite', imagen: 'https://i.ibb.co/VMyhV6R/mobil.png', precio: 4500, stock: 6, esNuevo: true, enOferta: true },
    { id: '2', nombre: 'Filtro de Aire - Toyota Hilux', marca: 'Toyota', modelo: 'Hilux', anio: 2024, repuesto: 'Filtro', imagen: 'https://placehold.co/400x400/ADD8E6/000000?text=Filtro+Aire', precio: 12000, stock: 15, esNuevo: false, enOferta: false },
    { id: '3', nombre: 'Pastillas de Freno - Nissan Frontier', marca: 'Nissan', modelo: 'Frontier', anio: 2023, repuesto: 'Freno', imagen: 'https://placehold.co/400x400/90EE90/000000?text=Pastillas+Freno', precio: 25000, stock: 0, esNuevo: false, enOferta: true },
    { id: '4', nombre: 'Amortiguador Trasero - Toyota Corolla', marca: 'Toyota', modelo: 'Corolla', anio: 2022, repuesto: 'Amortiguador', imagen: 'https://placehold.co/400x400/FFB6C1/000000?text=Amortiguador', precio: 30000, stock: 10, esNuevo: true, enOferta: false },
  ];

  get ofertas() {
    return this.productos.filter(p => p.enOferta);
  }
}
