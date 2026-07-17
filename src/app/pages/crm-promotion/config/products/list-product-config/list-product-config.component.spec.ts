import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListProductConfigComponent } from './list-product-config.component';

describe('ListProductConfigComponent', () => {
  let component: ListProductConfigComponent;
  let fixture: ComponentFixture<ListProductConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListProductConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListProductConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
