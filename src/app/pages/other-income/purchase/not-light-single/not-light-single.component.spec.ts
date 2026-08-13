import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { NotLightSingleComponent } from './not-light-single.component';
import { OTHER_INCOME_PAGE_TOKEN } from '../../../../lib';

describe('NotLightSingleComponent', () => {
  let component: NotLightSingleComponent;
  let fixture: ComponentFixture<NotLightSingleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotLightSingleComponent],
      // OTHER_INCOME_PAGE_TOKEN comes from route providers in other-income.route.ts, which
      // uses { isPurchase: true } on every purchase route.
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: OTHER_INCOME_PAGE_TOKEN, useValue: { isPurchase: true } },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotLightSingleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
