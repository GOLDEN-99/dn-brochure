import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CnCompleteComponent } from './cn-complete.component';

describe('CnCompleteComponent', () => {
  let component: CnCompleteComponent;
  let fixture: ComponentFixture<CnCompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CnCompleteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CnCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
