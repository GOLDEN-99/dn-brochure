import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseTemplateComponent } from './purchase-template.component';

describe('PurchaseTemplateComponent', () => {
  let component: PurchaseTemplateComponent;
  let fixture: ComponentFixture<PurchaseTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseTemplateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
