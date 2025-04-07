import { Component, computed, Signal, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BaseSubmitCn } from '../../../lib/cn';
import { FormsModule } from '@angular/forms';
import { UploaderComponent } from '../../../components/uploader/uploader.component';

@Component({
  selector: 'app-cn-upload',
  imports: [FormsModule, RouterLink, UploaderComponent],
  templateUrl: './cn-upload.component.html',
  styleUrl: './cn-upload.component.scss'
})
export class CnUploadComponent extends BaseSubmitCn {

  override totalprice = signal(0)
  override disable = computed(() => this.totalprice() === 0 || this.image.length === 0)
  override goodList = signal([])

}
