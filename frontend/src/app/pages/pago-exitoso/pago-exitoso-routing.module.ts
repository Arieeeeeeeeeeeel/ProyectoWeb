import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PagoExitosoPage } from './pago-exitoso.page';

const routes: Routes = [
  {
    path: '',
    component: PagoExitosoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagoExitosoPageRoutingModule {}
