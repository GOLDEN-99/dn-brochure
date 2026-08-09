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
    // NOTE: the component declares `members = input.required<TMember>()`, but its body calls
    // .reduce()/.map() on it and emits `as TMember` -- it is really a boolean tuple like
    // TDayState, and the declared type is wrong. Passing what the code actually requires.
    // Nothing references this component (no import, no template usage), so the mistyping has
    // never bitten anyone; see the commit message re: dropping it.
    fixture.componentRef.setInput('members', [true, true, true, true, true, true, true]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
