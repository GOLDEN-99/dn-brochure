import { Component, input } from '@angular/core';
import { InlineMemberComponent } from "../../inline-member/inline-member.component";
import { InlineBranchLimitComponent } from "../../inline-branch-limit/inline-branch-limit.component";
import { FieldTree } from '@angular/forms/signals';
import { TPromotionBranch, TPromotionMember } from '../../../../types/crm-promotion.type';
import { FormAlertTextComponent } from "../../form-alert-text.component";

@Component({
  selector: 'app-promotion-limit-usage',
  imports: [InlineMemberComponent, InlineBranchLimitComponent, FormAlertTextComponent],
  templateUrl: './promotion-limit-usage.component.html',
  styles: '',
})
export class PromotionLimitUsageComponent {
  memberForm = input.required<FieldTree<TPromotionMember>>()
  branchForm = input.required<FieldTree<TPromotionBranch>>()
  onRemoveMember(id: number){
    this.memberForm().members().controlValue.update(members => members.filter(member => member.id !== id))
  }
  onRemoveBranch(branchCode: string){
    this.branchForm().branches().controlValue.update(branches => branches.filter(branch => branch.branchCode !== branchCode))
  }
}
