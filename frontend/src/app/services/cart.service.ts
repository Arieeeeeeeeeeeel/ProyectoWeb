// src/app/services/cart.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartApiService } from './cart-api.service';
import { AuthService } from './auth.service';

export interface CartItem {
  productoId?: string; // Solo productos
  id?: string;         // Solo reservas
  nombre: string;
  imagen?: string;
  precio: number;
  quantity?: number;   // Solo productos
  stock?: number;      // Solo productos
  detalles?: any;      // Solo reservas
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private _cartItems = new BehaviorSubject<CartItem[]>([]);
  readonly cartItems$: Observable<CartItem[]> = this._cartItems.asObservable();
  private usuarioId: number | null = null;

  constructor(
    private cartApi: CartApiService,
    private authService: AuthService
  ) {
    // Cargar el carrito desde localStorage al iniciar el servicio
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      this._cartItems.next(JSON.parse(storedCart));
    }
    // Obtener rut del usuario autenticado
    this.authService.currentUser$.subscribe(user => {
      this.usuarioId = user?.personaid || null;
      if (this.usuarioId) {
        this.syncCartFromBackend();
      }
    });
  }

  private syncCartFromBackend() {
    if (!this.usuarioId) return;
    this.cartApi.getCart(this.usuarioId).subscribe((data: any) => {
      if (data && data.items) {
        // Mapear items del backend al formato CartItem
        const items: CartItem[] = data.items.map((item: any) => ({
          productoId: item.producto_id !== undefined
            ? String(item.producto_id)
            : (item.producto && item.producto.producto_id !== undefined
                ? String(item.producto.producto_id)
                : undefined),
          nombre: item.producto?.nombre || '',
          imagen: item.producto?.imagen_url,
          precio: item.producto?.precio || 0,
          quantity: item.cantidad,
          stock: item.producto?.stock
        }));
        this._cartItems.next(items);
        this.saveCart();
      }
    });
  }

  private saveCart(): void {
    localStorage.setItem('cart', JSON.stringify(this._cartItems.getValue()));
  }

  addItem(item: CartItem, quantity: number = 1): boolean {
    const currentItems = this._cartItems.getValue();

    // Si es producto (debe tener productoId y NO id)
    if (item.productoId) {
      // Elimina el campo id si existe para productos
      const { id, ...itemSinId } = item;
      // Busca si ya existe un producto con el mismo productoId
      const existingItemIndex = currentItems.findIndex(i => i.productoId === item.productoId);
      if (existingItemIndex > -1) {
        const existingItem = currentItems[existingItemIndex];
        if (existingItem.stock !== undefined && existingItem.quantity !== undefined) {
          if (existingItem.quantity + quantity > existingItem.stock) {
            return false;
          }
        }
        existingItem.quantity = (existingItem.quantity || 0) + quantity;
      } else {
        currentItems.push({
          ...itemSinId,
          quantity: quantity,
        });
      }
    } else if (item.id && !item.productoId) {
      // Es una reserva, no agrupar
      currentItems.push({
        ...item
      });
    } else {
      // Si no tiene productoId ni id, o tiene ambos, no agregar
      return false;
    }

    this._cartItems.next([...currentItems]);
    this.saveCart();

    if (this.usuarioId && item.productoId) {
      this.cartApi.addOrUpdateItem(this.usuarioId, Number(item.productoId), (item.quantity || 0) + quantity)
        .subscribe(() => this.syncCartFromBackend());
    }
    return true;
  }

  removeItem(id: string) {
    const currentItems = this._cartItems.getValue();
    console.log('[CartService] Intentando eliminar producto/reserva:', id, currentItems);
    // Busca si es producto (por productoId, siempre string)
    const productIndex = currentItems.findIndex(item => String(item.productoId) === String(id));
    if (productIndex > -1) {
      console.log('[CartService] Producto encontrado en el carrito, eliminando localmente');
      // Guardar copia para posible rollback
      const prevItems = [...currentItems];
      currentItems.splice(productIndex, 1);
      this._cartItems.next([...currentItems]);
      this.saveCart();
      if (this.usuarioId && id) {
        console.log('[CartService] Llamando a backend para eliminar producto', this.usuarioId, id);
        this.cartApi.removeItem(this.usuarioId, Number(id)).subscribe(
          () => {
            // Éxito: no hacer nada, ya está actualizado localmente
          },
          error => {
            console.error('[CartService] Error al eliminar producto en backend', error);
            // Rollback local
            this._cartItems.next(prevItems);
            this.saveCart();
            // Opcional: notificar error visualmente
            // Puedes emitir un evento o usar un servicio de notificación
          }
        );
      }
      return;
    }
    // Si es reserva (por id), elimina solo esa reserva
    const filteredItems = currentItems.filter(item => !(item.id && String(item.id) === String(id)));
    if (filteredItems.length !== currentItems.length) {
      console.log('[CartService] Reserva encontrada y eliminada localmente');
    }
    this._cartItems.next(filteredItems);
    this.saveCart();
  }

  updateItemQuantity(productId: string, quantity: number): boolean {
    const currentItems = this._cartItems.getValue();
    const item = currentItems.find(i => String(i.productoId) === String(productId));
    console.log('[CartService] Actualizando cantidad', productId, 'a', quantity, 'Item:', item);
    if (item && item.stock !== undefined && quantity > item.stock) {
      console.warn('[CartService] Stock insuficiente para producto', productId);
      return false;
    }
    if (item && item.quantity !== undefined) {
      // Guardar copia para posible rollback
      const prevQuantity = item.quantity;
      item.quantity = quantity;
      this._cartItems.next(currentItems);
      this.saveCart();
      if (this.usuarioId && productId) {
        console.log('[CartService] Llamando a backend para actualizar cantidad', this.usuarioId, productId, quantity);
        this.cartApi.addOrUpdateItem(this.usuarioId, Number(productId), quantity)
          .subscribe(
            () => {
              // Éxito: no hacer nada, ya está actualizado localmente
            },
            error => {
              console.error('[CartService] Error al actualizar cantidad en backend', error);
              // Rollback local
              item.quantity = prevQuantity;
              this._cartItems.next([...currentItems]);
              this.saveCart();
              // Opcional: notificar error visualmente
            }
          );
      }
      return true;
    }
    console.warn('[CartService] No se encontró el producto para actualizar cantidad', productId);
    return false;
  }

  clearCart(): void {
    this._cartItems.next([]);
    this.saveCart();
    if (this.usuarioId) {
      this.cartApi.clearCart(this.usuarioId).subscribe(() => this.syncCartFromBackend());
    }
  }

  getCartTotal(): number {
    return this._cartItems.getValue().reduce((total, item) => {
      if (item.quantity !== undefined) {
        return total + (item.precio * item.quantity);
      } else {
        return total + item.precio;
      }
    }, 0);
  }

  getCartItemCount(): number {
    return this._cartItems.getValue().reduce((count, item) => {
      if (item.quantity !== undefined) {
        return count + item.quantity;
      } else {
        return count + 1;
      }
    }, 0);
  }
}