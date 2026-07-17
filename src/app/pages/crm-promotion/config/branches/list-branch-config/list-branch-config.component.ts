import { Component, computed, inject, signal } from '@angular/core';
import { ToastService } from '../../../../../service/toast/toast.service';
import { BranchConfigService } from '../../../../../service/crm-promotion/branch-config.service';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-list-branch-config',
  imports: [FormsModule, RouterLink],
  templateUrl: './list-branch-config.component.html',
  styles: '',
})
export class ListBranchConfigComponent {
  private readonly toastService = inject(ToastService)
  private readonly crmGroupService = inject(BranchConfigService)
  private readonly branchGroup = this.crmGroupService.allBranchGroup
  disabled = signal(false)
  canNotAdd = computed(() => this.serachTerm() === "" || this.renderGroup().length !== 0 || this.disabled())
  serachTerm = signal('')
  renderGroup = computed(() => {
    const term = this.serachTerm().toLocaleLowerCase()
    return this.branchGroup().filter(group =>
      group.name.toLocaleLowerCase().includes(term)
    )
  })


  onDelete(id: number) {

  }
}
