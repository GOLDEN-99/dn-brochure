import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FsBrochureComponent } from './fs-brochure.component';

describe('FsBrochureComponent', () => {
  let component: FsBrochureComponent;
  let fixture: ComponentFixture<FsBrochureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FsBrochureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FsBrochureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
