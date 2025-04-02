import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavigateBtnComponent } from './navigate-btn.component';

describe('NavigateBtnComponent', () => {
  let component: NavigateBtnComponent;
  let fixture: ComponentFixture<NavigateBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavigateBtnComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavigateBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
