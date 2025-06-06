import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TargetSubformComponent } from './target-subform.component';

describe('TargetSubformComponent', () => {
  let component: TargetSubformComponent;
  let fixture: ComponentFixture<TargetSubformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TargetSubformComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TargetSubformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
