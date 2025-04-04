import { Component, inject, model, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UploaderComponent } from "../../components/uploader/uploader.component";
import { FormService } from '../../service/form/form.service';
import { TMaybe } from '../../types';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cn-upload',
  imports: [FormsModule, RouterLink, UploaderComponent],
  templateUrl: './cn-upload.component.html',
  styleUrl: './cn-upload.component.scss'
})
export class CnUploadComponent {
  private formServ = inject(FormService)
  file: TMaybe<File> = null

  amount = model(0)

  submit() {
    console.log(this.file)
  }
}
