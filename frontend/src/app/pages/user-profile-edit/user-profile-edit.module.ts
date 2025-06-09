import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 

import { IonicModule } from '@ionic/angular';

import { UserProfileEditPageRoutingModule } from './user-profile-edit-routing.module';

import { UserProfileEditPage } from './user-profile-edit.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule, 
    IonicModule,
    UserProfileEditPageRoutingModule
  ],
  declarations: [UserProfileEditPage]
})
export class UserProfileEditPageModule {}