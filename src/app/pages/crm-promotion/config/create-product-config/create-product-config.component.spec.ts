import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateProductConfigComponent } from './create-product-config.component';

describe('CreateProductConfigComponent', () => {
  let component: CreateProductConfigComponent;
  let fixture: ComponentFixture<CreateProductConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateProductConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateProductConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
