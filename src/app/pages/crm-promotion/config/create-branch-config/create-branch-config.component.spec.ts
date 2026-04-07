import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateBranchConfigComponent } from './create-branch-config.component';

describe('CreateBranchConfigComponent', () => {
  let component: CreateBranchConfigComponent;
  let fixture: ComponentFixture<CreateBranchConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateBranchConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateBranchConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
