import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotaItemWholeListComponent } from './quota-item-whole-list.component';

describe('QuotaItemWholeListComponent', () => {
  let component: QuotaItemWholeListComponent;
  let fixture: ComponentFixture<QuotaItemWholeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuotaItemWholeListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuotaItemWholeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
