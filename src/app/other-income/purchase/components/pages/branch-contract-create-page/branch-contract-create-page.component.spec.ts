import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchContractCreatePageComponent } from './branch-contract-create-page.component';

describe('BranchContractCreatePageComponent', () => {
  let component: BranchContractCreatePageComponent;
  let fixture: ComponentFixture<BranchContractCreatePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchContractCreatePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BranchContractCreatePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
