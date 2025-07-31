import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchCompSubformComponent } from './search-comp-subform.component';

describe('SearchCompSubformComponent', () => {
  let component: SearchCompSubformComponent;
  let fixture: ComponentFixture<SearchCompSubformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchCompSubformComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchCompSubformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
