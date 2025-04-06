import { Component, inject } from '@angular/core';
import { UploaderComponent } from "../../components/uploader/uploader.component";
import { FormService } from '../../service/form/form.service';
import { TMaybe } from '../../types';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cn-all',
  imports: [UploaderComponent, RouterLink],
  templateUrl: './cn-all.component.html',
  styleUrl: './cn-all.component.scss'
})
export class CnAllComponent {
  private formServ = inject(FormService)
  file: TMaybe<File> = null

  submit() {
    console.log(this.file)
  }
}
