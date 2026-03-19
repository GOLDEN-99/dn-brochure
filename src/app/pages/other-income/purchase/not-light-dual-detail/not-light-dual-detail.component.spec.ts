import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotLightDualDetailComponent } from './not-light-dual-detail.component';

describe('NotLightDualDetailComponent', () => {
  let component: NotLightDualDetailComponent;
  let fixture: ComponentFixture<NotLightDualDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotLightDualDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotLightDualDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
