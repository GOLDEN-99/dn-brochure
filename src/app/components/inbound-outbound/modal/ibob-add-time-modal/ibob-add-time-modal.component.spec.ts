import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IbobAddTimeModalComponent } from './ibob-add-time-modal.component';

describe('IbobAddTimeModalComponent', () => {
  let component: IbobAddTimeModalComponent;
  let fixture: ComponentFixture<IbobAddTimeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IbobAddTimeModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IbobAddTimeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
