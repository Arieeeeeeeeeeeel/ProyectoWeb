// src/app/services/cart.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

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

  constructor() {
    // Cargar el carrito desde localStorage al iniciar el servicio
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      this._cartItems.next(JSON.parse(storedCart));
    }
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
    return true;
  }

  removeItem(id: string) {
    const currentItems = this._cartItems.getValue();
    // Busca si es producto (por productoId)
    const productIndex = currentItems.findIndex(item => item.productoId === id);
    if (productIndex > -1) {
      // Elimina todos los productos de ese tipo (sin importar la cantidad)
      currentItems.splice(productIndex, 1);
      this._cartItems.next([...currentItems]);
      this.saveCart();
      return;
    }
    // Si es reserva (por id), elimina solo esa reserva
    const filteredItems = currentItems.filter(item => !(item.id && item.id === id));
    this._cartItems.next(filteredItems);
    this.saveCart();
  }

  updateItemQuantity(productId: string, quantity: number): boolean {
    const currentItems = this._cartItems.getValue();
    const item = currentItems.find(i => i.productoId === productId);

    if (item && item.stock !== undefined && quantity > item.stock) {
      return false;
    }
    if (item && item.quantity !== undefined) {
      item.quantity = quantity;
      this._cartItems.next(currentItems);
      this.saveCart();
      return true;
    }
    return false;
  }

  clearCart(): void {
    this._cartItems.next([]);
    this.saveCart();
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