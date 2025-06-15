// src/app/pages/producto-detalle/producto-detalle.page.ts

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { CartService } from '../../services/cart.service';
import { ProductosService, Producto } from '../../services/productos.service';

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
})
export class ProductoDetallePage implements OnInit {
  producto: Producto | undefined;
  productId: number | null = null;
  loadError: boolean = false;

  isLoggedIn: boolean = false;
  hasCars: boolean = false;
  isCompatible: boolean = false;
  compatibleCarModel: string = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private cartService: CartService,
    private productosService: ProductosService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    const idParam = this.activatedRoute.snapshot.paramMap.get('id');
    this.productId = idParam ? Number(idParam) : null;
    if (this.productId) {
      this.loadProductDetails(this.productId);
    } else {
      console.error('Error: No se proporcionó ID de producto en la URL.');
      this.loadError = true;
    }
    this.checkUserStatus();
  }

  loadProductDetails(id: number) {
    this.loadError = false;
    this.productosService.getProducto(id).subscribe({
      next: (producto) => {
        this.producto = producto;
        this.checkCompatibility();
      },
      error: (err) => {
        console.error('Error al cargar el producto:', err);
        this.loadError = true;
      }
    });
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
      (this.producto?.marca || '').toLowerCase().includes(car.make.toLowerCase()) &&
      (this.producto?.modelo || '').toLowerCase().includes(car.model.toLowerCase())
    );
    if (compatibleCar) {
      this.isCompatible = true;
      this.compatibleCarModel = compatibleCar.model;
    } else {
      this.isCompatible = false;
      this.compatibleCarModel = '';
    }
  }

  async addToCart() {
    if (this.producto) {
      if (this.producto.stock <= 0) {
        await this.presentToast('Este producto no tiene stock disponible.', 'danger');
        return;
      }
      const added = this.cartService.addItem({
        productoId: this.producto.producto_id.toString(),
        nombre: this.producto.nombre,
        imagen: this.producto.imagen_url,
        precio: this.producto.precio,
        stock: this.producto.stock
      }, 1);
      if (added) {
        console.log('Producto añadido al carrito:', this.producto.producto_id);
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

  get productoKeyValue() {
    return this.producto as any;
  }
}