import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UserProfileEditPage } from './user-profile-edit.page';

const routes: Routes = [
  {
    path: '',
    component: UserProfileEditPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserProfileEditPageRoutingModule {}
