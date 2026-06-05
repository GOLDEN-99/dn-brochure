import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncentiveHomePageComponent } from './incentive-home-page.component';

describe('IncentiveHomePageComponent', () => {
  let component: IncentiveHomePageComponent;
  let fixture: ComponentFixture<IncentiveHomePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncentiveHomePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncentiveHomePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
