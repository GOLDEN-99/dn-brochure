import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { OverlapReport, PromotionOverlap } from '../../../lib/crm-promotion/promotion-overlap';
import { PromotionPriorityPipe } from '../../../lib/crm-promotion/promotion-priority.pipe';
import { PromotionOrderPipe } from '../../../lib/crm-promotion/promotion-order.pipe';
import { ProductNamePipe } from '../../../lib/crm-promotion/product-name.pipe';

// How many shared goods a row lists before folding the rest into a count
const SHOWN_PRODUCTS = 5;

type Tone = 'danger' | 'warning' | 'info';

const TONE: Record<PromotionOverlap['outcome'], Tone> = {
  COLLISION: 'danger',
  EXCLUSIVE: 'warning',
  SHARES_UNITS: 'info',
  STACKS: 'info',
};

// "โปรนี้" is the live one on the row; "โปรที่กำลังบันทึก" is the one in the form (create or edit)
export function outcomeText(o: PromotionOverlap): string {
  switch (o.outcome) {
    case 'COLLISION':
      return `priority เท่ากัน (${o.existing.promotionPriority}) — เมื่อตะกร้าเข้าเงื่อนไขทั้งสองโปรพร้อมกัน ระบบจะไม่ให้ส่วนลดเลยทั้งคู่`;
    case 'EXCLUSIVE':
      return o.existingFirst
        ? 'โปรนี้ priority สูงกว่า — เมื่อโปรนี้ทำงาน โปรที่กำลังบันทึกจะถูกข้าม'
        : 'โปรที่กำลังบันทึก priority สูงกว่า — เมื่อทำงาน โปรนี้จะถูกข้าม';
    case 'SHARES_UNITS':
      return o.existingFirst
        ? 'ใช้ร่วมกันได้ — โปรนี้หยิบสินค้าจัดชุดก่อน โปรที่กำลังบันทึกได้เฉพาะชิ้นที่เหลือ'
        : 'ใช้ร่วมกันได้ — โปรที่กำลังบันทึกหยิบสินค้าจัดชุดก่อน โปรนี้ได้เฉพาะชิ้นที่เหลือ';
    case 'STACKS':
      return 'ใช้ร่วมกันได้ — ส่วนลดของทั้งสองโปรจะรวมกันบนสินค้าเดียวกัน';
  }
}

/**
 * The pre-save confirmation: every live promotion of the same kind that names a good this one
 * names, with what the till does when both are active (sale RULES §1.22, §1.23). A COLLISION
 * (same non-zero priority: the level yields nothing) refuses the save; anything else asks.
 *
 * Opened through NgbModal with the report set on the instance; closes with `true` to save,
 * dismisses otherwise. `report` null means the check itself failed and the author decides.
 */
@Component({
  selector: 'app-promotion-overlap-modal',
  imports: [DatePipe, PromotionPriorityPipe, PromotionOrderPipe, ProductNamePipe],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div class="modal-header">
      <h4 class="modal-title">
        @if (failed()) {
          ตรวจสอบโปรโมชั่นที่ซ้อนกันไม่สำเร็จ
        } @else if (blocking()) {
          บันทึกไม่ได้: โปรโมชั่นชนกัน
        } @else {
          มีโปรโมชั่นที่ใช้สินค้าร่วมกัน
        }
      </h4>
      <button type="button" class="btn-close" aria-label="Close" (click)="cancel()"></button>
    </div>

    <div class="modal-body">
      @if (failed()) {
        <p class="mb-0" data-testid="overlap-failed">
          เรียกรายการโปรโมชั่นที่ใช้งานอยู่ไม่ได้ จึงยังไม่ได้ตรวจว่ามีโปรโมชั่นอื่นใช้สินค้าเดียวกันหรือไม่
          จะบันทึกต่อโดยไม่ตรวจ หรือยกเลิกแล้วลองใหม่ก็ได้
        </p>
      } @else {
        <p class="text-muted">
          @if (blocking()) {
            โปรโมชั่นที่กำลังบันทึกมี priority เท่ากับโปรโมชั่นที่ใช้งานอยู่และใช้สินค้าเดียวกัน
            หน้าร้านจะไม่ให้ส่วนลดทั้งคู่เมื่อเข้าเงื่อนไขพร้อมกัน — แก้ priority หรือกลุ่มสินค้าก่อน
          } @else {
            โปรโมชั่นที่ใช้งานอยู่ด้านล่างใช้สินค้าเดียวกันในช่วงเวลา สาขา และสมาชิกที่ซ้อนกัน
            ตรวจผลที่หน้าร้านก่อนยืนยัน
          }
        </p>
        <ul class="list-group" data-testid="overlap-list">
          @for (row of rows(); track row.existing.id) {
            <li class="list-group-item" [attr.data-outcome]="row.outcome">
              <div class="d-flex justify-content-between align-items-start gap-2">
                <div>
                  <a [href]="'/crm-promotion/' + row.existing.id" target="_blank" rel="noopener" class="fw-semibold">
                    {{ row.existing.promotionName }}
                  </a>
                  <div class="small text-muted">
                    {{ row.existing.startdate | date: 'dd/MM/yyyy' }} – {{ row.existing.enddate | date: 'dd/MM/yyyy' }}
                    · {{ row.existing.promotionPriority | promotionPriority }}
                    · {{ row.existing.promotionOrder | promotionOrder }}
                  </div>
                </div>
                <span class="badge text-bg-{{ row.tone }}">{{ row.label }}</span>
              </div>
              <div class="mt-1">{{ row.text }}</div>
              <div class="small mt-1">
                สินค้าที่ใช้ร่วมกัน:
                @for (p of row.shown; track p.goodCode + '|' + (p.unitCode ?? '')) {
                  <span class="badge text-bg-light border me-1">{{ p | productName }}</span>
                }
                @if (row.more > 0) {
                  <span class="text-muted">และอีก {{ row.more }} รายการ</span>
                }
              </div>
            </li>
          }
        </ul>
      }
    </div>

    <div class="modal-footer">
      @if (blocking()) {
        <button type="button" class="btn btn-primary" data-testid="overlap-back" (click)="cancel()">กลับไปแก้ไข</button>
      } @else {
        <button type="button" class="btn btn-outline-secondary" data-testid="overlap-cancel" (click)="cancel()">ยกเลิก</button>
        <button type="button" class="btn btn-primary" data-testid="overlap-confirm" (click)="confirm()">
          @if (failed()) {
            บันทึกโดยไม่ตรวจ
          } @else {
            ยืนยันบันทึก
          }
        </button>
      }
    </div>
  `,
})
export class PromotionOverlapModalComponent {
  private readonly activeModal = inject(NgbActiveModal);

  /** Set by the opener. `null` = the check failed. */
  readonly report = signal<OverlapReport | null | undefined>(undefined);

  readonly failed = computed(() => this.report() === null);
  readonly blocking = computed(() => this.report()?.blocking ?? false);

  readonly rows = computed(() =>
    (this.report()?.overlaps ?? []).map((o) => ({
      ...o,
      text: outcomeText(o),
      tone: TONE[o.outcome],
      label: LABEL[o.outcome],
      shown: o.sharedProducts.slice(0, SHOWN_PRODUCTS),
      more: Math.max(0, o.sharedProducts.length - SHOWN_PRODUCTS),
    })),
  );

  confirm() {
    this.activeModal.close(true);
  }

  cancel() {
    this.activeModal.dismiss();
  }
}

const LABEL: Record<PromotionOverlap['outcome'], string> = {
  COLLISION: 'ชนกัน',
  EXCLUSIVE: 'เลือกอย่างเดียว',
  SHARES_UNITS: 'แบ่งสินค้ากัน',
  STACKS: 'ลดซ้อนกัน',
};
