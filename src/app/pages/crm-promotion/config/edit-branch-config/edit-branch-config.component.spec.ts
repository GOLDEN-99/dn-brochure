import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBranchConfigComponent } from './edit-branch-config.component';

describe('EditBranchConfigComponent', () => {
  let component: EditBranchConfigComponent;
  let fixture: ComponentFixture<EditBranchConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditBranchConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditBranchConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
