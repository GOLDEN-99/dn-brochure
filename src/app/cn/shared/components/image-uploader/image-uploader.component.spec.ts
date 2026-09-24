import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';

import { ImageUploaderComponent } from './image-uploader.component';
import { CnUploadImageService } from '../../services/cn-upload-image.service';
import { LoadingService } from '../../../../service/loading/loading.service';

describe('ImageUploaderComponent', () => {
  let component: ImageUploaderComponent;
  let fixture: ComponentFixture<ImageUploaderComponent>;
  let uploadServ: jasmine.SpyObj<CnUploadImageService>;
  let loadingServ: jasmine.SpyObj<LoadingService>;
  let failSpy: jasmine.Spy;
  let successSpy: jasmine.Spy;

  const IMG = 'data:image/png;base64,AAAA';

  beforeEach(async () => {
    uploadServ = jasmine.createSpyObj('CnUploadImageService', ['uploadFileV2']);
    loadingServ = jasmine.createSpyObj('LoadingService', ['startLoad', 'endLoad']);

    await TestBed.configureTestingModule({
      imports: [ImageUploaderComponent],
      providers: [{ provide: LoadingService, useValue: loadingServ }],
    })
      // CnUploadImageService is in the component's own `providers`, which beats
      // anything registered on the TestBed module — it has to be swapped here.
      .overrideComponent(ImageUploaderComponent, {
        set: { providers: [{ provide: CnUploadImageService, useValue: uploadServ }] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ImageUploaderComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('wholeNumb', 'WS001');

    failSpy = jasmine.createSpy('fail');
    successSpy = jasmine.createSpy('success');
    component.fail.subscribe(failSpy);
    component.success.subscribe(successSpy);

    fixture.detectChanges();
  });

  describe('uploadSingle', () => {
    it('appends the link, emits success and ends loading when the upload succeeds', () => {
      uploadServ.uploadFileV2.and.returnValue(of({ link: 'https://img/1.png' }));

      component.uploadSingle(IMG);

      expect(uploadServ.uploadFileV2).toHaveBeenCalledWith({ wholeNumb: 'WS001', img: IMG });
      expect(loadingServ.startLoad).toHaveBeenCalledTimes(1);
      expect(component.value()).toEqual(['https://img/1.png']);
      expect(successSpy).toHaveBeenCalled();
      expect(failSpy).not.toHaveBeenCalled();
      expect(loadingServ.endLoad).toHaveBeenCalledTimes(1);
    });

    it('emits fail and still ends loading when the upload errors', () => {
      uploadServ.uploadFileV2.and.returnValue(throwError(() => new Error('500')));

      component.uploadSingle(IMG);

      expect(failSpy).toHaveBeenCalledWith('มีปัญหาอัพโหลด');
      expect(successSpy).not.toHaveBeenCalled();
      expect(component.value()).toEqual([]);
      expect(loadingServ.endLoad).toHaveBeenCalledTimes(1);
    });

    it('keeps loading on while the request is in flight', () => {
      const response$ = new Subject<{ link: string }>();
      uploadServ.uploadFileV2.and.returnValue(response$);

      component.uploadSingle(IMG);
      expect(loadingServ.startLoad).toHaveBeenCalled();
      expect(loadingServ.endLoad).not.toHaveBeenCalled();

      response$.error(new Error('timeout'));
      expect(loadingServ.endLoad).toHaveBeenCalledTimes(1);
    });

    it('emits fail without calling the API or starting loading when wholeNumb is empty', () => {
      fixture.componentRef.setInput('wholeNumb', '');

      component.uploadSingle(IMG);

      expect(failSpy).toHaveBeenCalled();
      expect(uploadServ.uploadFileV2).not.toHaveBeenCalled();
      expect(loadingServ.startLoad).not.toHaveBeenCalled();
    });
  });

  describe('onSelectFile', () => {
    // A real <input type="file"> refuses a non-empty `value` assignment, so a
    // plain object stands in for the event target.
    const selectEvent = (file: File) => {
      const target = { files: [file], value: 'C:\\fakepath\\' + file.name };
      return { event: { target } as unknown as Event, target };
    };

    it('reads an image file and passes its data URL to uploadSingle', async () => {
      const called = new Promise<string>(resolve =>
        spyOn(component, 'uploadSingle').and.callFake(resolve)
      );

      component.onSelectFile(selectEvent(new File(['x'], 'a.png', { type: 'image/png' })).event);

      expect(await called).toMatch(/^data:image\/png;base64,/);
    });

    it('rejects a non-image file without uploading', () => {
      spyOn(component, 'uploadSingle');

      component.onSelectFile(selectEvent(new File(['x'], 'a.pdf', { type: 'application/pdf' })).event);

      expect(failSpy).toHaveBeenCalledWith('Please select an image file');
      expect(component.uploadSingle).not.toHaveBeenCalled();
    });

    it('clears the input so the same file can be selected again', async () => {
      // wait for the FileReader, otherwise it fires after this spec's spy is torn down
      const called = new Promise<void>(resolve =>
        spyOn(component, 'uploadSingle').and.callFake(() => resolve())
      );
      const { event, target } = selectEvent(new File(['x'], 'a.png', { type: 'image/png' }));

      component.onSelectFile(event);

      expect(target.value).toBe('');
      await called;
    });
  });

  it('removeImage drops only the matching link', () => {
    component.value.set(['a', 'b', 'c']);

    component.removeImage('b');

    expect(component.value()).toEqual(['a', 'c']);
  });
});
