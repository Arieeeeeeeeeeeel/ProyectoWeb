import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SeleccionPage } from './seleccion-servicio.page';

describe('SeleccionPage', () => {
  let component: SeleccionPage;
  let fixture: ComponentFixture<SeleccionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SeleccionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

