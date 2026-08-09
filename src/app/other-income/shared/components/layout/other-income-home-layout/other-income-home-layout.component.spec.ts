import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { OtherIncomeHomeLayoutComponent } from './other-income-home-layout.component';

describe('OtherIncomeHomeLayoutComponent', () => {
  let component: OtherIncomeHomeLayoutComponent;
  let fixture: ComponentFixture<OtherIncomeHomeLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtherIncomeHomeLayoutComponent],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtherIncomeHomeLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
