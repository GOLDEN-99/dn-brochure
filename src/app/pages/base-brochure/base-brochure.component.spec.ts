import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseBrochureComponent } from './base-brochure.component';

describe('BaseBrochureComponent', () => {
  let component: BaseBrochureComponent;
  let fixture: ComponentFixture<BaseBrochureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaseBrochureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BaseBrochureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
