import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InOutQueryComponent } from './in-out-query.component';

describe('InOutQueryComponent', () => {
  let component: InOutQueryComponent;
  let fixture: ComponentFixture<InOutQueryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InOutQueryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InOutQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
