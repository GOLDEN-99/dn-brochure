import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectDoorOptionComponent } from './select-door-option.component';

describe('SelectDoorOptionComponent', () => {
  let component: SelectDoorOptionComponent;
  let fixture: ComponentFixture<SelectDoorOptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectDoorOptionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectDoorOptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
