import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { IbobAdminEditComponent } from './ibob-admin-edit.component';

describe('IbobAdminEditComponent', () => {
  let component: IbobAdminEditComponent;
  let fixture: ComponentFixture<IbobAdminEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IbobAdminEditComponent],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IbobAdminEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
