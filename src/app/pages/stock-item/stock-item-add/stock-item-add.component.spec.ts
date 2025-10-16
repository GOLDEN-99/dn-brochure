import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockItemAddComponent } from './stock-item-add.component';

describe('StockItemAddComponent', () => {
  let component: StockItemAddComponent;
  let fixture: ComponentFixture<StockItemAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockItemAddComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockItemAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
