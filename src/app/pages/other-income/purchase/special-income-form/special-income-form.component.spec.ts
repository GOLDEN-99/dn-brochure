import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialIncomeFormComponent } from './special-income-form.component';

describe('SpecialIncomeFormComponent', () => {
  let component: SpecialIncomeFormComponent;
  let fixture: ComponentFixture<SpecialIncomeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecialIncomeFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpecialIncomeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
