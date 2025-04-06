import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WholeHeadComponent } from './whole-head.component';

describe('WholeHeadComponent', () => {
  let component: WholeHeadComponent;
  let fixture: ComponentFixture<WholeHeadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WholeHeadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WholeHeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
