import { Component, inject, input, model, output } from '@angular/core';
import { CnUploadImageService } from '../../services/cn-upload-image.service';
import { LoadingService } from '../../../../service/loading/loading.service';
import { FormValueControl } from '@angular/forms/signals';

@Component({
  selector: 'cn-image-uploader',
  imports: [],
  templateUrl: './image-uploader.component.html',
  styleUrl: './image-uploader.component.scss',
  providers: [CnUploadImageService]
})
export class ImageUploaderComponent implements FormValueControl<Array<string>> {
  private readonly loadingServ = inject(LoadingService)
  private readonly uploadServ = inject(CnUploadImageService)
  disabled = input(false)
  cannotUpload = input(false)

  wholeNumb = input.required<string>()
  fail = output<string>()
  success = output<string>()

  value = model<string[]>([])


  uploadSingle(img: string) { // accept blob here
    const wholeNumb = this.wholeNumb()
    if (!wholeNumb) {
      this.fail.emit("เกิดข้อผิดพลาด ไม่สามารถอ่านเลข WS ได้")
      return
    }
    this.loadingServ.startLoad()
    this.uploadServ.uploadFileV2({ wholeNumb, img }).subscribe({
      next: ({ link }) => {
        this.value.update(prev => [...prev, link])
        this.success.emit('อัพโหลดสำเร็จ')
      },
      error: (err) => {
        this.fail.emit('มีปัญหาอัพโหลด')
      },
      complete: () => this.loadingServ.endLoad()
    })
  }


  clearSelection() {
    this.value.set([])
  }

  onSelectFile(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      this.fail.emit('Please select an image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const file = e.target?.result as string
      this.uploadSingle(file)
    };
    reader.readAsDataURL(file);
  }

  removeImage(link: string) {
    this.value.update(prev => prev.filter(p => p !== link))
  }
}
