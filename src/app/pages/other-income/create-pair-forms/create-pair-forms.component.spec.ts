import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePairFormsComponent } from './create-pair-forms.component';

describe('CreatePairFormsComponent', () => {
  let component: CreatePairFormsComponent;
  let fixture: ComponentFixture<CreatePairFormsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePairFormsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatePairFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
