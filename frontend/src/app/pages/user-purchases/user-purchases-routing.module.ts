import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserPurchasesPage } from './user-purchases.page';

const routes: Routes = [
  { path: '', component: UserPurchasesPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserPurchasesPageRoutingModule {}
