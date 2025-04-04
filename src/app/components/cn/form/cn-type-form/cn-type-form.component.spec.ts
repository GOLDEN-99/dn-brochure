import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CnTypeFormComponent } from './cn-type-form.component';

describe('CnTypeFormComponent', () => {
  let component: CnTypeFormComponent;
  let fixture: ComponentFixture<CnTypeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CnTypeFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CnTypeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
