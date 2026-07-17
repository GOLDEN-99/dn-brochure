import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchContractListPageComponent } from './branch-contract-list-page.component';

describe('BranchContractListPageComponent', () => {
  let component: BranchContractListPageComponent;
  let fixture: ComponentFixture<BranchContractListPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchContractListPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BranchContractListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
