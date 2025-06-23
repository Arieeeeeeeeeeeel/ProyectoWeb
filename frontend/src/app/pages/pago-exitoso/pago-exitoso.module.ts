import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PagoExitosoPage } from './pago-exitoso.page';
import { PagoExitosoPageRoutingModule } from './pago-exitoso-routing.module';
import { PurchaseService } from '../../services/purchase.service';
import { AuthService } from '../../services/auth.service';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PagoExitosoPageRoutingModule
  ],
  providers: [CurrencyPipe, PurchaseService, AuthService],
  declarations: [PagoExitosoPage]
})
export class PagoExitosoPageModule {}
