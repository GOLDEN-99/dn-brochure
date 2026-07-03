import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OtherIncomePurchaseApiService } from '../../../services/other-income-purchase-api.service';
import { OtherIncomeEventService } from '../../../../shared/services/other-income-event.service';
import { ContractListController } from '../../../../shared/libs/contract-list-controller';

@Component({
  selector: 'app-order-contract-list-page',
  imports: [RouterLink, DatePipe, FormsModule],
  templateUrl: './order-contract-list-page.component.html',
  styleUrl: './order-contract-list-page.component.scss',
})
export class OrderContractListPageComponent {
  private readonly api = inject(OtherIncomePurchaseApiService);
  private readonly eventService = inject(OtherIncomeEventService);

  readonly list = new ContractListController({
    fetch: () => this.api.getOrderContracts(),
  });

  contractLabelOptions = computed(() =>
    this.eventService.event().filter(e => e.eventType === 'ORDER')
  );
}
