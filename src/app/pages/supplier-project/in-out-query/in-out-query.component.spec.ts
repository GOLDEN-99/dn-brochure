import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { InOutQueryComponent } from './in-out-query.component';

describe('InOutQueryComponent', () => {
  let component: InOutQueryComponent;
  let fixture: ComponentFixture<InOutQueryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InOutQueryComponent],
      providers: [provideRouter([])]
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
