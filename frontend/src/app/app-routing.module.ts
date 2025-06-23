import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  
  {
    path: 'servicios',
    loadChildren: () => import('./pages/servicios/servicios.module').then( m => m.ServiciosPageModule)
  },
  {
    path: 'quienes-somos',
    loadChildren: () => import('./pages/quienes-somos/quienes-somos.module').then( m => m.QuienesSomosPageModule)
  },
  {
    path: 'seleccion-servicio',
    loadChildren: () => import('./pages/seleccion-servicio/seleccion-servicio.module').then( m => m.SeleccionServicioPageModule)
  },
  {
    path: 'inventario',
    loadChildren: () => import('./pages/inventario/inventario.module').then( m => m.InventarioPageModule)
  },
  {
    path: 'registrar',
    loadChildren: () => import('./pages/registrar/registrar.module').then( m => m.RegistrarPageModule)
  },
  {
    path: 'user-profile',
    loadChildren: () => import('./pages/user-profile/user-profile.module').then( m => m.UserProfilePageModule)
  },
  {
    path: 'user-profile-edit',
    loadChildren: () => import('./pages/user-profile-edit/user-profile-edit.module').then( m => m.UserProfileEditPageModule)
  },
  {
    path: 'user-profile',
    loadChildren: () => import('./pages/user-profile/user-profile.module').then( m => m.UserProfilePageModule)
  },
  {
    path: 'user-profile-edit', // Nueva ruta para la edición del perfil
    loadChildren: () => import('./pages/user-profile-edit/user-profile-edit.module').then( m => m.UserProfileEditPageModule)
  },
  {
    path: 'reset-password',
    loadChildren: () => import('./pages/reset-password/reset-password.module').then( m => m.ResetPasswordPageModule)
  },
  {
    path: 'productos',
    loadChildren: () => import('./pages/productos/productos.module').then( m => m.ProductosPageModule)
  },
  {
    path: 'producto-detalle/:id',
    loadChildren: () => import('./pages/producto-detalle/producto-detalle.module').then( m => m.ProductoDetallePageModule)
  },
  {
    path: 'carrito',
    loadChildren: () => import('./pages/carrito/carrito.module').then( m => m.CarritoPageModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('./pages/admin/admin.module').then( m => m.AdminPageModule)
  },
  {
    path: 'inventario-admin',
    loadChildren: () => import('./pages/inventario-admin/inventario-admin.module').then( m => m.InventarioAdminPageModule)
  },
  {
    path: 'pago-exitoso',
    loadChildren: () => import('./pages/pago-exitoso/pago-exitoso.module').then(m => m.PagoExitosoPageModule)
  },
  {
    path: 'user-purchases',
    loadChildren: () => import('./pages/user-purchases/user-purchases.module').then(m => m.UserPurchasesPageModule)
  }


];


@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
    ReactiveFormsModule
  ],
  exports: [RouterModule, ReactiveFormsModule]
  
})
export class AppRoutingModule { }
