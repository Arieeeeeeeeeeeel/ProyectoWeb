import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SeleccionPage } from './seleccion-servicio.page';

const routes: Routes = [
  {
    path: '',
    component: SeleccionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SeleccionServicioPageRoutingModule {}
