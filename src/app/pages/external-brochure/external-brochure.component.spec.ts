import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalBrochureComponent } from './external-brochure.component';

describe('ExternalBrochureComponent', () => {
  let component: ExternalBrochureComponent;
  let fixture: ComponentFixture<ExternalBrochureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExternalBrochureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExternalBrochureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
