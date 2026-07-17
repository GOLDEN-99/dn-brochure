import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { OtherIncomePurchaseApiService } from '../../../services/other-income-purchase-api.service';
import { OtherIncomeEventService } from '../../../../shared/services/other-income-event.service';
import { ContractListController } from '../../../../shared/libs/contract-list-controller';
import { isoToNgbDate, ngbDateToIso, startOfYearRange } from '../../../../shared/libs/date-time';
import { CALC_TYPE_LABEL } from '../../../../shared/types/other-income.type';
import { DatePickerComponent } from '../../../../../shared/components/date-picker/date-picker.component';

@Component({
  selector: 'app-order-contract-list-page',
  imports: [RouterLink, DatePipe, DecimalPipe, FormsModule, DatePickerComponent],
  templateUrl: './order-contract-list-page.component.html',
  styleUrl: './order-contract-list-page.component.scss',
})
export class OrderContractListPageComponent {
  private readonly api = inject(OtherIncomePurchaseApiService);
  private readonly eventService = inject(OtherIncomeEventService);

  readonly calcTypeLabel = CALC_TYPE_LABEL;

  readonly list = new ContractListController({
    fetch: params => this.api.getOrderContracts(params),
    defaultDateRange: startOfYearRange,
  });

  contractLabelOptions = computed(() =>
    this.eventService.event().filter(e => e.eventType === 'ORDER')
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
