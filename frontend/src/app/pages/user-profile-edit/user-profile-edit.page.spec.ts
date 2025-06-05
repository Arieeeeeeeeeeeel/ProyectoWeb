import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserProfileEditPage } from './user-profile-edit.page';

describe('UserProfileEditPage', () => {
  let component: UserProfileEditPage;
  let fixture: ComponentFixture<UserProfileEditPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UserProfileEditPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
