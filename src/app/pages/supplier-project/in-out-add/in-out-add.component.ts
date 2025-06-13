import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DoorFormService } from '../../../service/ibob/door-form.service';
import { DoorMutationService } from '../../../service/ibob/door-mutation.service';
import { NgbTimepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { DoorService } from '../../../service/ibob/door.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../service/toast/toast.service';

@Component({
  selector: 'app-in-out-add',
  imports: [ReactiveFormsModule, NgbTimepickerModule, FormsModule],
  templateUrl: './in-out-add.component.html',
  styleUrl: './in-out-add.component.scss'
})
export class InOutAddComponent {
  private doorFormServ = inject(DoorFormService)
  private doorMutServ = inject(DoorMutationService)
  private doorServ = inject(DoorService)
  private router = inject(Router)
  private toastServ = inject(ToastService)
  private route = inject(ActivatedRoute)

  durationStep = this.doorFormServ.durationStep
  headForm = this.doorFormServ.headForm
  slotForm = this.doorFormServ.slotForm
  dayKey = this.doorFormServ.keys
  getDayOfWeek = this.doorFormServ.getThaiDay
  addForm = this.doorFormServ.addForm
  removeForm = this.doorFormServ.removeForm
  getDisable = this.doorFormServ.getDisableState

  submitForm = () => {
    const head = this.doorFormServ.getFormHead()
    const time = this.doorFormServ.getTimeList()
    this.doorMutServ.createDoor({
      door: head,
      time
    }).subscribe({
      next: (res) => {
        console.log(res);
        console.log('ok');
        this.toastServ.success('เพิ่มสำเร็จ')
        this.doorServ.refetch()
        this.router.navigate(['../'], { relativeTo: this.route })
      },
      error: (err) => {
        console.error(err);
        this.toastServ.danger(`มีข้อผิดพลาด ${err.message}`)
      }
    })
  }

}
