// src/app/pages/producto-detalle/producto-detalle.page.ts

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular'; // Importa ToastController
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service'; // Importa el CartService

// Interfaz para el producto (debe ser consistente con la de productos.page.ts)
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
}

// Interfaz para un auto del usuario (ejemplo, ajusta según tu modelo de datos)
interface UserCar {
  id: string;
  make: string;
  model: string;
  year: number;
}

@Component({
  selector: 'app-producto-detalle',
  templateUrl: './producto-detalle.page.html',
  styleUrls: ['./producto-detalle.page.scss'],
  standalone: false,
  // imports: [IonicModule, CommonModule, FormsModule] // Estas importaciones van en el .module.ts para no-standalone
})
export class ProductoDetallePage implements OnInit {
  producto: Producto | undefined;
  productId: string | null = null;
  loadError: boolean = false;

  isLoggedIn: boolean = false;
  hasCars: boolean = false;
  isCompatible: boolean = false;
  compatibleCarModel: string = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private cartService: CartService, // Inyecta el CartService
    private toastController: ToastController // Inyecta ToastController
    // private authService: AuthService, // <--- PARA UN PROYECTO REAL: Servicio de autenticación
    // private userService: UserService, // <--- PARA UN PROYECTO REAL: Servicio para obtener autos del usuario
    // private productoService: ProductoService // <--- PARA UN PROYECTO REAL: Servicio para obtener detalles del producto
  ) { }

  ngOnInit() {
    this.productId = this.activatedRoute.snapshot.paramMap.get('id');
    if (this.productId) {
      this.loadProductDetails(this.productId);
    } else {
      console.error('Error: No se proporcionó ID de producto en la URL.');
      this.loadError = true;
    }

    this.checkUserStatus();
  }

  async loadProductDetails(id: string) {
    this.loadError = false;

    const allProducts: Producto[] = [
      { id: '1', nombre: 'MOBIL DELVAC SUPER 20W-50 B-4 LTS', marca: 'Mobil', modelo: 'Delval super 20w-50 B-4 LTS', anio: 2024, repuesto: 'Aceite', imagen: 'https://i.ibb.co/VMyhV6R/mobil.png', precio: 4500, stock: 6, esNuevo: true },
      { id: '2', nombre: 'Filtro de Aire - Toyota Hilux', marca: 'Toyota', modelo: 'Hilux', anio: 2024, repuesto: 'Filtro', imagen: 'https://placehold.co/400x400/ADD8E6/000000?text=Filtro+Aire', precio: 12000, stock: 15, esNuevo: false },
      { id: '3', nombre: 'Pastillas de Freno - Nissan Frontier', marca: 'Nissan', modelo: 'Frontier', anio: 2023, repuesto: 'Freno', imagen: 'https://placehold.co/400x400/90EE90/000000?text=Pastillas+Freno', precio: 25000, stock: 0, esNuevo: false },
      { id: '4', nombre: 'Amortiguador Trasero - Toyota Corolla', marca: 'Toyota', modelo: 'Corolla', anio: 2022, repuesto: 'Amortiguador', imagen: 'https://placehold.co/400x400/FFB6C1/000000?text=Amortiguador', precio: 30000, stock: 10, esNuevo: true },
    ];

    this.producto = allProducts.find(p => p.id === id);

    if (!this.producto) {
      console.error('Producto no encontrado para ID:', id);
      this.loadError = true;
    } else {
      this.checkCompatibility();
    }
  }

  checkUserStatus() {
    this.isLoggedIn = true;
    this.hasCars = true;

    if (this.isLoggedIn && this.hasCars && this.producto) {
      this.checkCompatibility();
    }
  }

  checkCompatibility() {
    if (!this.producto || !this.isLoggedIn || !this.hasCars) {
      this.isCompatible = false;
      this.compatibleCarModel = '';
      return;
    }

    const userCars: UserCar[] = [
      { id: 'car1', make: 'Toyota', model: 'Hilux', year: 2024 },
      { id: 'car2', make: 'Nissan', model: 'Versa', year: 2020 },
    ];

    const compatibleCar = userCars.find(car =>
      this.producto?.marca.toLowerCase().includes(car.make.toLowerCase()) &&
      this.producto?.modelo.toLowerCase().includes(car.model.toLowerCase())
    );

    if (compatibleCar) {
      this.isCompatible = true;
      this.compatibleCarModel = compatibleCar.model;
    } else {
      this.isCompatible = false;
      this.compatibleCarModel = '';
    }
  }

  // Modificación del método addToCart
  async addToCart() { // Ya no necesita productId como argumento, lo toma de this.producto
    if (this.producto) {
      if (this.producto.stock <= 0) {
        await this.presentToast('Este producto no tiene stock disponible.', 'danger');
        return;
      }

      const added = this.cartService.addItem({
        id: this.producto.id,
        nombre: this.producto.nombre,
        imagen: this.producto.imagen,
        precio: this.producto.precio,
        stock: this.producto.stock // Pasa el stock al servicio del carrito
      }, 1); // Cantidad por defecto 1

      if (added) {
        console.log('Producto añadido al carrito:', this.producto.id);
        await this.presentToast('Producto añadido al carrito.', 'success');
      } else {
        await this.presentToast('No se pudo añadir el producto. Stock insuficiente o ya en carrito.', 'warning');
      }
    }
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }
}