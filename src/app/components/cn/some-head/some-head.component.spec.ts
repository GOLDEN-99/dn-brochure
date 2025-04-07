import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SomeHeadComponent } from './some-head.component';

describe('SomeHeadComponent', () => {
  let component: SomeHeadComponent;
  let fixture: ComponentFixture<SomeHeadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SomeHeadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SomeHeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
