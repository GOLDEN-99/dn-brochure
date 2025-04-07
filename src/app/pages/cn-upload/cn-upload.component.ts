import { Component, computed, Signal, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UploaderComponent } from "../../components/uploader/uploader.component";
import { FormsModule } from '@angular/forms';
import { BaseSubmitCn } from '../../lib/cn';
import { TGoodItemReq } from '../../types/cn.type';

@Component({
  selector: 'app-cn-upload',
  imports: [FormsModule, RouterLink, UploaderComponent],
  templateUrl: './cn-upload.component.html',
  styleUrl: './cn-upload.component.scss'
})
export class CnUploadComponent extends BaseSubmitCn {

  override totalprice = signal(0)
  override disable = computed(() => this.totalprice() === 0 || this.image.length === 0)
  override goodList: Signal<TGoodItemReq[]> = signal([])

}
