import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrmPromotionLayoutComponent } from './crm-promotion-layout.component';

describe('CrmPromotionLayoutComponent', () => {
  let component: CrmPromotionLayoutComponent;
  let fixture: ComponentFixture<CrmPromotionLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrmPromotionLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrmPromotionLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
