import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotaItemAddComponent } from './quota-item-add.component';

describe('QuotaItemAddComponent', () => {
  let component: QuotaItemAddComponent;
  let fixture: ComponentFixture<QuotaItemAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuotaItemAddComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuotaItemAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
