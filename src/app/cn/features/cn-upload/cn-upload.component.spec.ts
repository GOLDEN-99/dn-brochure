import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CnUploadComponent } from './cn-upload.component';

describe('CnUploadComponent', () => {
  let component: CnUploadComponent;
  let fixture: ComponentFixture<CnUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CnUploadComponent]
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
