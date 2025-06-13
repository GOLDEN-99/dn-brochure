import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InOutAddComponent } from './in-out-add.component';

describe('InOutAddComponent', () => {
  let component: InOutAddComponent;
  let fixture: ComponentFixture<InOutAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InOutAddComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InOutAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
