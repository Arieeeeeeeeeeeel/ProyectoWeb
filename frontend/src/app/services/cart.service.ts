// src/app/services/cart.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CartItem {
  productoId: string;
  nombre: string;
  imagen?: string;
  precio: number;
  quantity: number;
  stock: number; // Para verificar el stock al añadir
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

  addItem(item: { id: string, nombre: string, imagen?: string, precio: number, stock: number }, quantity: number = 1): boolean {
    const currentItems = this._cartItems.getValue();
    const existingItemIndex = currentItems.findIndex(i => i.productoId === item.id);

    if (existingItemIndex > -1) {
      const existingItem = currentItems[existingItemIndex];
      // Verificar si hay suficiente stock para añadir más
      if (existingItem.quantity + quantity > item.stock) {
        return false; // No hay suficiente stock
      }
      existingItem.quantity += quantity;
    } else {
      // Verificar si hay suficiente stock para el nuevo ítem
      if (quantity > item.stock) {
        return false; // No hay suficiente stock
      }
      currentItems.push({
        productoId: item.id,
        nombre: item.nombre,
        imagen: item.imagen,
        precio: item.precio,
        quantity: quantity,
        stock: item.stock // Almacenar el stock original del producto
      });
    }
    this._cartItems.next(currentItems);
    this.saveCart();
    return true; // Se añadió correctamente
  }

  removeItem(productId: string): void {
    const currentItems = this._cartItems.getValue().filter(item => item.productoId !== productId);
    this._cartItems.next(currentItems);
    this.saveCart();
  }

  updateItemQuantity(productId: string, quantity: number): boolean {
    const currentItems = this._cartItems.getValue();
    const itemIndex = currentItems.findIndex(item => item.productoId === productId);

    if (itemIndex > -1) {
      const item = currentItems[itemIndex];
      if (quantity <= 0) {
        this.removeItem(productId);
        return true;
      }
      // Asegurarse de no exceder el stock
      if (quantity > item.stock) {
        return false; // No hay suficiente stock
      }
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
    return this._cartItems.getValue().reduce((total, item) => total + (item.precio * item.quantity), 0);
  }

  getCartItemCount(): number {
    return this._cartItems.getValue().reduce((count, item) => count + item.quantity, 0);
  }
}