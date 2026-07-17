import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSingleCompWithoutProductComponent } from './create-single-comp-without-product.component';

describe('CreateSingleCompWithoutProductComponent', () => {
  let component: CreateSingleCompWithoutProductComponent;
  let fixture: ComponentFixture<CreateSingleCompWithoutProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateSingleCompWithoutProductComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateSingleCompWithoutProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
