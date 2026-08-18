import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromoContractListPageComponent } from './promo-contract-list-page.component';

describe('PromoContractListPageComponent', () => {
  let component: PromoContractListPageComponent;
  let fixture: ComponentFixture<PromoContractListPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromoContractListPageComponent]
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
