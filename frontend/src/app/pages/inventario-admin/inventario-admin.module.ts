import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InventarioAdminPageRoutingModule } from './inventario-admin-routing.module';

import { InventarioAdminPage } from './inventario-admin.page';

@NgModule({
  declarations: [InventarioAdminPage],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InventarioAdminPageRoutingModule
  ]
})
export class InventarioAdminPageModule {}
