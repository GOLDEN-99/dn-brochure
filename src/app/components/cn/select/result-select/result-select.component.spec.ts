import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultSelectComponent } from './result-select.component';

describe('ResultSelectComponent', () => {
  let component: ResultSelectComponent;
  let fixture: ComponentFixture<ResultSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
