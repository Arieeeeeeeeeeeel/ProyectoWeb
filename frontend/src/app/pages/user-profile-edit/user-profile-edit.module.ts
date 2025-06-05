// src/app/user-profile-edit/user-profile-edit.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // ¡Importa ReactiveFormsModule!

import { IonicModule } from '@ionic/angular';

import { UserProfileEditPageRoutingModule } from './user-profile-edit-routing.module';

import { UserProfileEditPage } from './user-profile-edit.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule, // ¡ESTO ES LO CLAVE!
    IonicModule,
    UserProfileEditPageRoutingModule
  ],
  declarations: [UserProfileEditPage]
})
export class UserProfileEditPageModule {}