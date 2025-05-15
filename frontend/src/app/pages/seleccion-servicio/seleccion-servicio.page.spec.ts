import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SeleccionServicioPage } from './seleccion-servicio.page';

describe('SeleccionServicioPage', () => {
  let component: SeleccionServicioPage;
  let fixture: ComponentFixture<SeleccionServicioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SeleccionServicioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
