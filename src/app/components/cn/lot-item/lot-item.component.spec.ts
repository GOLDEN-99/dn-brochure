import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LotItemComponent } from './lot-item.component';

describe('LotItemComponent', () => {
  let component: LotItemComponent;
  let fixture: ComponentFixture<LotItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LotItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LotItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
