import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CnRadioComponent } from './cn-radio.component';

describe('CnRadioComponent', () => {
  let component: CnRadioComponent;
  let fixture: ComponentFixture<CnRadioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CnRadioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CnRadioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
