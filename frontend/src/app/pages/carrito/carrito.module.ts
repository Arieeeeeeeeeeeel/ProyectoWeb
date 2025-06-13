// src/app/pages/carrito/carrito.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common'; // <--- MUST BE HERE
import { FormsModule } from '@angular/forms'; // <--- MUST BE HERE (for ngModel)

import { IonicModule } from '@ionic/angular';

import { CarritoPageRoutingModule } from './carrito-routing.module';

import { CarritoPage } from './carrito.page';

@NgModule({
  imports: [
    CommonModule, // <--- Make sure CommonModule is imported here
    FormsModule,  // <--- Make sure FormsModule is imported here
    IonicModule,
    CarritoPageRoutingModule
  ],
  declarations: [CarritoPage]
})
export class CarritoPageModule {}
