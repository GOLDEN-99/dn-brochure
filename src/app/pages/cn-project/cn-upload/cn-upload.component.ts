import { Component, computed, signal } from '@angular/core';
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

  touch = signal(false)

  handleInput = (e: Event) => {
    this.touch.set(true)
    const input = e.target as HTMLInputElement
    const price = Number(input.value)
    if (price < 0 || isNaN(price)) {
      input.value = '0'
    }
  }

  invalidInput = computed(() => (this.totalprice() <= 0 || this.invalid()) && this.touch())

  inputStyle = computed(() => {
    if (!this.touch()) return 'form-control'
    return this.invalidInput()
      ? 'form-control is-invalid'
      : 'form-control is-valid'
  })
  override totalprice = this.orderServ.rawPrice
  override disable = computed(
    () => this.invalidInput()
      || !this.touch()
      || this.imageServ.invalidImage()
      || this.remarkServ.cnType() !== null
  )
  override goodList = signal([])

  invalid = signal(false)

  handleChange(price: number) {
    this.touch.set(true)
    if (price <= 0) {
      this.invalid.set(true)
      return
    }
    this.orderServ.rawPrice.update(() => price)
    this.invalid.set(false)
  }
}
