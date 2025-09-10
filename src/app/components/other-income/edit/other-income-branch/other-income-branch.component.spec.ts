import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherIncomeBranchComponent } from './other-income-branch.component';

describe('OtherIncomeBranchComponent', () => {
  let component: OtherIncomeBranchComponent;
  let fixture: ComponentFixture<OtherIncomeBranchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtherIncomeBranchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtherIncomeBranchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
