import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { OtherIncomePurchaseApiService } from '../../../services/other-income-purchase-api.service';
import { OtherIncomeEventService } from '../../../../shared/services/other-income-event.service';
import { ContractListController } from '../../../../shared/libs/contract-list-controller';
import { isoToNgbDate, ngbDateToIso, startOfMonthRange } from '../../../../shared/libs/date-time';
import { DatePickerComponent } from '../../../../../shared/components/date-picker/date-picker.component';

@Component({
  selector: 'app-promo-contract-list-page',
  imports: [RouterLink, DatePipe, DecimalPipe, FormsModule, DatePickerComponent],
  templateUrl: './promo-contract-list-page.component.html',
  styleUrl: './promo-contract-list-page.component.scss',
})
export class PromoContractListPageComponent {
  private readonly api = inject(OtherIncomePurchaseApiService);
  private readonly eventService = inject(OtherIncomeEventService);

  readonly list = new ContractListController({
    fetch: params => this.api.getPromoContracts(params),
    defaultDateRange: startOfMonthRange,
  });

  contractLabelOptions = computed(() =>
    this.eventService.event().filter(e => e.eventType === 'PROMO')
  );

  startDate = computed(() => isoToNgbDate(this.list.startDateFilter()));
  endDate = computed(() => isoToNgbDate(this.list.endDateFilter()));

  onStartDateChange(date: NgbDateStruct): void {
    this.list.setStartDateFilter(ngbDateToIso(date));
  }

  onEndDateChange(date: NgbDateStruct): void {
    this.list.setEndDateFilter(ngbDateToIso(date));
  }
}
