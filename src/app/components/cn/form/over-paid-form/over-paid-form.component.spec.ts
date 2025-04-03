import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverPaidFormComponent } from './over-paid-form.component';

describe('OverPaidFormComponent', () => {
  let component: OverPaidFormComponent;
  let fixture: ComponentFixture<OverPaidFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverPaidFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OverPaidFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
