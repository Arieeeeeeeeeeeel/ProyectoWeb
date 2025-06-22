import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { UserPurchasesPage } from './user-purchases.page';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', component: UserPurchasesPage }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [UserPurchasesPage]
})
export class UserPurchasesPageModule {}
