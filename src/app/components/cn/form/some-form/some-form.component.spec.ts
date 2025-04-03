import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SomeFormComponent } from './some-form.component';

describe('SomeFormComponent', () => {
  let component: SomeFormComponent;
  let fixture: ComponentFixture<SomeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SomeFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SomeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
