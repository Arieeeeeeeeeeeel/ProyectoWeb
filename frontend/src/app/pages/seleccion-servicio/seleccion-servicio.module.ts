import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SeleccionServicioPageRoutingModule } from './seleccion-servicio-routing.module';

import { SeleccionPage } from './seleccion-servicio.page';
import { HttpClientModule } from '@angular/common/http'; // <-- Agregado

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SeleccionServicioPageRoutingModule,
    HttpClientModule // <-- Agregado
  ],
  declarations: [SeleccionPage]
})
export class SeleccionServicioPageModule {}
