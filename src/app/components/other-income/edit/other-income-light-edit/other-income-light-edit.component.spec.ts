import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherIncomeLightEditComponent } from './other-income-light-edit.component';

describe('OtherIncomeLightEditComponent', () => {
  let component: OtherIncomeLightEditComponent;
  let fixture: ComponentFixture<OtherIncomeLightEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtherIncomeLightEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtherIncomeLightEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
