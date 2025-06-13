import { Component, computed, input, model, OnInit, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ibob-query-tab',
  imports: [FormsModule],
  templateUrl: './ibob-query-tab.component.html',
  styles: ``
})
export class IbobQueryTabComponent {
  private optionRefMap = new Map([[1, 'ชื่อซัพพลายเออร์'], [2, 'เลข PO']])
  private optionRefList = [...this.optionRefMap.entries()].map(([id, label]) => ({ id, label }))
  selectOption = signal(this.optionRefList)

  currentOption = signal(0)
  term = signal('')

  onCurrentOptionChange = (s: number) => {
    this.currentOption.update(() => s);
    this.term.update(() => '')
  }

  inputLabel = computed(() => this.optionRefMap.get(this.currentOption()) ?? 'มีข้อผิดพลาด')
  inputId = computed(() => `text-opt-${this.currentOption()}`)
  fieldName = computed(() => {
    const cur = this.currentOption()
    if (cur === 1) return 'supplier'
    if (cur === 2) return 'po'
    return null
  })

  search = output()

  onClick = () => {
    this.search.emit()
  }

  // ngOnInit(): void {
  //   const ref = [...this.optionRefMap.entries()]
  //   const formatRef = ref.map(([id, label]) => ({ id, label }))
  //   this.selectOption.set(formatRef)
  // }
}
