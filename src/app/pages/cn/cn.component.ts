import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseFormComponent } from "../../components/cn/form/base-form/base-form.component";
import { FormService } from '../../service/form/form.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cn',
  imports: [ReactiveFormsModule, BaseFormComponent],
  templateUrl: './cn.component.html',
  styleUrl: './cn.component.scss'
})
export class CnComponent {
  formServ = inject(FormService)
  router = inject(Router)

  onClick() {
    const endpoint = this.formServ.endpointNavigation()
    this.router.navigateByUrl(`cn/${endpoint}`)
  }
}
