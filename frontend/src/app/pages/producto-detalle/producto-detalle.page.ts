// src/app/pages/producto-detalle/producto-detalle.page.ts

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { CartService } from '../../services/cart.service';
import { ProductosService, Producto } from '../../services/productos.service';
import { AuthService } from '../../services/auth.service';
import { VehiculoService, Vehiculo } from '../../services/vehiculo.service';

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
  userCars: Vehiculo[] = [];
  isCompatible: boolean = false;
  compatibleCarModel: string = '';

  userRating: number = 0;
  ratingSubmitting: boolean = false;
  ratingError: string = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private cartService: CartService,
    private productosService: ProductosService,
    private toastController: ToastController,
    private authService: AuthService,
    private vehiculoService: VehiculoService
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

  cargarAutosUsuario() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.vehiculoService.getVehiculosUsuario(user.personaid).subscribe({
        next: autos => {
          this.userCars = autos;
          this.hasCars = autos.length > 0;
          this.checkCompatibility();
        },
        error: () => {
          this.userCars = [];
          this.hasCars = false;
          this.checkCompatibility();
        }
      });
    } else {
      this.userCars = [];
      this.hasCars = false;
      this.checkCompatibility();
    }
  }

  loadProductDetails(id: number) {
    this.loadError = false;
    this.productosService.getProducto(id).subscribe({
      next: (producto: any) => {
        this.producto = producto;
        // Si el backend devuelve user_valoracion, lo usamos
        if (producto.user_valoracion !== undefined && producto.user_valoracion !== null) {
          this.userRating = producto.user_valoracion;
        } else {
          this.userRating = 0;
        }
        this.checkCompatibility();
      },
      error: (err) => {
        console.error('Error al cargar el producto:', err);
        this.loadError = true;
      }
    });
  }

  checkUserStatus() {
    // Usa AuthService para verificar si el usuario está autenticado
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.cargarAutosUsuario();
    });
  }

  checkCompatibility() {
    if (!this.producto || !this.isLoggedIn || !this.hasCars) {
      this.isCompatible = false;
      this.compatibleCarModel = '';
      return;
    }
    // Si el producto tiene compatibilidad definida, usarla
    const compatList = (this.producto as any).compatibilidad;
    if (Array.isArray(compatList) && compatList.length > 0) {
      // Buscar si algún auto del usuario es compatible con alguna entrada
      const compatibleCar = this.userCars.find(car =>
        compatList.some((c: any) =>
          c.marca_auto && c.modelo_auto &&
          c.marca_auto.toLowerCase() === car.marca.toLowerCase() &&
          c.modelo_auto.toLowerCase() === car.modelo.toLowerCase() &&
          (!c.ano_desde || car.ano >= c.ano_desde) &&
          (!c.ano_hasta || car.ano <= c.ano_hasta)
        )
      );
      if (compatibleCar) {
        this.isCompatible = true;
        this.compatibleCarModel = `${compatibleCar.marca} ${compatibleCar.modelo} (${compatibleCar.patente})`;
      } else {
        this.isCompatible = false;
        this.compatibleCarModel = '';
      }
      return;
    }
    // Si no hay compatibilidad definida, usar la lógica antigua (marca/modelo/año exactos)
    const compatibleCar = this.userCars.find(car =>
      !!car &&
      (this.producto!.marca || '').toLowerCase() === car.marca.toLowerCase() &&
      (this.producto!.modelo || '').toLowerCase() === car.modelo.toLowerCase() &&
      (!this.producto!.ano_compatible || (typeof car.ano === 'number' && this.producto!.ano_compatible === car.ano))
    );
    if (compatibleCar) {
      this.isCompatible = true;
      this.compatibleCarModel = `${compatibleCar.marca} ${compatibleCar.modelo} (${compatibleCar.patente})`;
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

  setRating(rating: number) {
    this.userRating = rating;
  }

  enviarValoracion() {
    if (!this.producto || !this.userRating) return;
    this.ratingSubmitting = true;
    this.ratingError = '';
    this.productosService.valorarProducto(this.producto.producto_id, this.userRating).subscribe({
      next: (res) => {
        this.producto!.rating = res.rating;
        this.producto!.user_valoracion = res.user_valoracion; // Actualiza el campo user_valoracion
        this.userRating = res.user_valoracion; // Refleja inmediatamente la valoración
        this.ratingSubmitting = false;
        this.presentToast('¡Gracias por tu valoración!', 'success');
      },
      error: (err) => {
        this.ratingError = 'Error al enviar valoración';
        this.ratingSubmitting = false;
      }
    });
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