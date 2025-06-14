import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InventarioAdminPage } from './inventario-admin.page';

const routes: Routes = [
  {
    path: '',
    component: InventarioAdminPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InventarioAdminPageRoutingModule {}
