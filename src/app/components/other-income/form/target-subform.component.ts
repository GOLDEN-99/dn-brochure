import { Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-target-subform',
  imports: [FormsModule],
  template: `
  <div>
    @let targetValue = target();
    <div class="mb-3">
      <label class="form-label" for="target">target</label>
      <select
        class="form-select"
        name="target"
        id="target"
        [ngModel]="targetValue"
        (ngModelChange)="changeTarget($event)"
      >
        <option [ngValue]="0" disabled>กรุณาเลือก</option>
        <option [ngValue]="1">flat บาทแรก</option>
        <option [ngValue]="2">step บาทแรก</option>
        <option [ngValue]="3">คิดแบบขั้นบันได</option>
      </select>
    </div>
    <div class="p-3">
      @if (needStep()) {
      <!--case stepType 2,3-->
        @let stepList = step();
      <ul style="padding: 0; margin: 0">
        @for (s of stepList; track $index) {
        <li class="step-item">
          <div class="row">
            <div class="col">
              <div class="app-form-field-inline">
                <div>
                  <label [attr.for]="'start-input-' + $index">ยอดซื้อตั้งแต่</label>
                </div>
                <div>
                  <input
                    [attr.name]="'start-input-' + $index"
                    [id]="'start-input-' + $index"
                    [ngModel]="s.start"
                    (ngModelChange)="changeStart($index)($event)"
                  />
                </div>
                <div>บาท</div>
              </div>
            </div>
            <div class="col">
              <div class="app-form-field-inline">
                <div>
                  <label [attr.for]="'percent-input-' + $index">คำนวน</label>
                </div>
                <div>
                  <input
                    [id]="'percent-input-' + $index"
                    [ngModel]="s.percent"
                    (ngModelChange)="changePercent($index)($event)"
                  />
                </div>
                <div>%</div>
              </div>
            </div>
            <div class="col-auto">
              <button
                class="btn btn-danger"
                (click)="deleteStep($index)"
                [disabled]="stepList.length === 1"
              >
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </li>
        }
      </ul>
      <div class="row justify-content-end">
        <div class="col-auto">
          <button class="btn btn-success" (click)="addStep()">
            <i class="bi bi-plus"></i>
          </button>
        </div>
      </div>
      } @else if(targetValue === 1) {
      <div class="bg-lightgray" style="padding: 0 8px">
        <div class="app-form-field-inline">
          <div style="margin: 16px 0">
            <label for="percent">ระบุ %</label>
          </div>
          <div style="margin: 16px 0">
            <input
              name="percent"
              id="percent"
              [ngModel]="step()[0].percent"
              (ngModelChange)="changePercent(0)($event)"
            />
          </div>
        </div>
      </div>
      }
    </div>
  </div>
  `,
  styles: `
  .step-item {
  list-style: none;
  background-color: #f5f5f5;
  padding: 0 8px;
  &:first-child {
    padding-top: 16px;
  }
}`
})
export class TargetSubformComponent {
  private defaultStep = { start: 0, percent: 0 }
  // 2wbd of target
  target = input(0)
  targetChange = output<number>()

  changeTarget(value: number) {
    const resetStep = [this.defaultStep]
    this.stepChange.emit(resetStep)
    this.targetChange.emit(value)
  }

  // 2wbd of step in case of target === 2 , 3 
  needStep = computed(() => [2, 3].includes(this.target()))
  step = input<TStepItem[]>([])
  stepChange = output<TStepItem[]>()
  private changeStepItem = <K extends keyof TStepItem>(k: K) => (idx: number) => (value: TStepItem[K]) => {
    const currentStep = this.step()
    const newStep = currentStep.map((p, i) => i === idx ? ({ ...p, [k]: Number(value) }) : p)
    this.stepChange.emit(newStep)
  }
  changeStart = this.changeStepItem('start')
  changePercent = this.changeStepItem('percent')
  deleteStep(idx: number) {
    const currentStep = this.step()
    const newStep = currentStep.filter((_, i) => i !== idx)
    this.stepChange.emit(newStep)
  }
  addStep() {
    const currentStep = this.step()
    const newStep = [...currentStep, this.defaultStep]
    this.stepChange.emit(newStep)
  }
}

type TStepItem = {
  start: number
  percent: number
}
