import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CnStateService } from '../../shared/services/cn-state.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { CnUploadComponent } from './cn-upload.component';

describe('CnUploadComponent', () => {
  let component: CnUploadComponent;
  let fixture: ComponentFixture<CnUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CnUploadComponent],
      providers: [CnStateService, provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CnUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
