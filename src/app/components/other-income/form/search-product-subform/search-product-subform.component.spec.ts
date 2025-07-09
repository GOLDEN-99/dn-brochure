import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchProductSubformComponent } from './search-product-subform.component';

describe('SearchProductSubformComponent', () => {
  let component: SearchProductSubformComponent;
  let fixture: ComponentFixture<SearchProductSubformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchProductSubformComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchProductSubformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
