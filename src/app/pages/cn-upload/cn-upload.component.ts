import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UploaderComponent } from "../../components/uploader/uploader.component";
import { FormService } from '../../service/form/form.service';
import { TMaybe } from '../../types';

@Component({
  selector: 'app-cn-upload',
  imports: [RouterLink, UploaderComponent],
  templateUrl: './cn-upload.component.html',
  styleUrl: './cn-upload.component.scss'
})
export class CnUploadComponent {
  private formServ = inject(FormService)
  file: TMaybe<File> = null

  submit() {
    console.log(this.file)
  }
}
