import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatSelectComponent } from './stat-select.component';

describe('StatSelectComponent', () => {
  let component: StatSelectComponent;
  let fixture: ComponentFixture<StatSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
