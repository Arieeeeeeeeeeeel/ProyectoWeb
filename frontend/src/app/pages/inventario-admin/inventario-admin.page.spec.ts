import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InventarioAdminPage } from './inventario-admin.page';

describe('InventarioAdminPage', () => {
  let component: InventarioAdminPage;
  let fixture: ComponentFixture<InventarioAdminPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(InventarioAdminPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
