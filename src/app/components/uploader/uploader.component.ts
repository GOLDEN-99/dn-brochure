import { Component, output, signal } from '@angular/core';
import { TMaybe } from '../../types';

@Component({
  selector: 'app-uploader',
  imports: [],
  templateUrl: './uploader.component.html',
  styleUrl: './uploader.component.scss'
})
export class UploaderComponent {
  preview: TMaybe<string> = null;
  previewList = signal<string[]>([])
  isUploading = false;
  uploadProgress = 0;
  selectedFile: TMaybe<File> = null;
  outfile = output<TMaybe<File>>()
  clearSelection() {
    this.preview = null
    this.selectedFile = null
    this.uploadProgress = 0;
    this.outfile.emit(null)
  }

  onSelectFile(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    this.selectedFile = file
    this.outfile.emit(file)
    const reader = new FileReader();
    reader.onload = (e) => {
      const file = e.target?.result as string
      console.log(file)
      this.preview = file
      this.previewList.update((prev) => [...prev, file])
    };
    reader.readAsDataURL(file);
  }
}
