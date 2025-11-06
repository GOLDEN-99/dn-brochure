import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotaItemListComponent } from './quota-item-list.component';

describe('QuotaItemListComponent', () => {
  let component: QuotaItemListComponent;
  let fixture: ComponentFixture<QuotaItemListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuotaItemListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuotaItemListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
