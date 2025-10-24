import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockItemHomeComponent } from './stock-item-home.component';

describe('StockItemHomeComponent', () => {
  let component: StockItemHomeComponent;
  let fixture: ComponentFixture<StockItemHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockItemHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockItemHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
