import { Component, computed, inject, model, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UploaderComponent } from "../../components/uploader/uploader.component";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cn-upload',
  imports: [FormsModule, RouterLink, UploaderComponent],
  templateUrl: './cn-upload.component.html',
  styleUrl: './cn-upload.component.scss'
})
export class CnUploadComponent {

  amount = model(0)

  cannotSubmit = computed(() => this.amount() === 0)

  submit() {

  }
}
