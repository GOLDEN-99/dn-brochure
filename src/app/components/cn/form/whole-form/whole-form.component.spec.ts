import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WholeFormComponent } from './whole-form.component';

describe('WholeFormComponent', () => {
  let component: WholeFormComponent;
  let fixture: ComponentFixture<WholeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WholeFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WholeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
