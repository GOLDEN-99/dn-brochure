import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberCheckboxComponent } from './member-checkbox.component';

describe('MemberCheckboxComponent', () => {
  let component: MemberCheckboxComponent;
  let fixture: ComponentFixture<MemberCheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberCheckboxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemberCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
