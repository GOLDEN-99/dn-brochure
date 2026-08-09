import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PromoContractListPageComponent } from './promo-contract-list-page.component';

describe('PromoContractListPageComponent', () => {
  let component: PromoContractListPageComponent;
  let fixture: ComponentFixture<PromoContractListPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromoContractListPageComponent],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromoContractListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
