import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { TDropdownProps, TPromotionType } from '../../../types';
import { Router } from '@angular/router';
import { DropdownComponent } from "../../../components/dropdown/dropdown.component";
@Component({
  selector: 'app-search-page',
  imports: [ReactiveFormsModule, DropdownComponent],
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.scss'
})
export class SearchPageComponent {
  private nnfb = inject(NonNullableFormBuilder)
  private router = inject(Router)
  optionRef: TDropdownProps<TPromotionType>[] = [
    { value: 'Monthly', label: 'โปรโมชั่น รายเดือน' },
    { value: 'SP', label: 'special' },
    { value: 'Hot', label: 'โปรโมชั่น hotprice' }
  ]
  searchForm = this.nnfb.group({
    wholeCode: this.nnfb.control("", Validators.required),
    promoType: this.nnfb.control<TPromotionType>("Monthly")
  })


  handleSubmit() {
    const { wholeCode, promoType } = this.searchForm.getRawValue()
    try {
      this.router.navigateByUrl(`/prochure/${wholeCode}/${promoType}`)
    } catch (err) {
      console.log(err)
    }
  }

}
