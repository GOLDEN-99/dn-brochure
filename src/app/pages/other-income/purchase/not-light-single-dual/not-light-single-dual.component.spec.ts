import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotLightSingleDualComponent } from './not-light-single-dual.component';

describe('NotLightSingleDualComponent', () => {
  let component: NotLightSingleDualComponent;
  let fixture: ComponentFixture<NotLightSingleDualComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotLightSingleDualComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotLightSingleDualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
