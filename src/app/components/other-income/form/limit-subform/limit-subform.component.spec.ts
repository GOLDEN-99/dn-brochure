import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LimitSubformComponent } from './limit-subform.component';

describe('LimitSubformComponent', () => {
  let component: LimitSubformComponent;
  let fixture: ComponentFixture<LimitSubformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LimitSubformComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LimitSubformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
