import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InOutEditComponent } from './in-out-edit.component';

describe('InOutEditComponent', () => {
  let component: InOutEditComponent;
  let fixture: ComponentFixture<InOutEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InOutEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InOutEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
