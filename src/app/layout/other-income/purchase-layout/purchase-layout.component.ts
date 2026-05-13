import { afterNextRender, Component, inject, InjectionToken, TemplateRef, viewChild } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { getItem, setItem } from '../../../service/local/local-lib';

type TTabItem = {
  label: string
  link: string
  exact: boolean
}
export interface ITabSetting {
  tabList: TTabItem[]
}

export const TAB_TOKEN = new InjectionToken<ITabSetting>('TAB_SETTING_TOKEN');

export const PURCHASE_TAB_TOKEN: ITabSetting = {
  tabList: [
    {
      label: 'รายได้อื่นๆ',
      link: './not-light',
      exact: true
    },
    {
      label: 'รายได้อื่นๆ light-box',
      link: './light',
      exact: false
    },
    {
      label: 'รายได้อื่นๆ 2 หัว',
      link: './not-light-dual',
      exact: false
    },
    {
      label: 'รายงานใหม่',
      link: './monthly-report',
      exact: false
    },
    {
      label: 'รายงานเดิม',
      link: './report',
      exact: false
    }
  ]
}

export const ACCOUNT_TAB_TOKEN: ITabSetting = {
  tabList: [
    {
      label: 'รายได้อื่นๆ',
      link: './not-light',
      exact: false
    },
    {
      label: 'รายได้อื่นๆ light-box',
      link: './light',
      exact: false
    },
    // {
    //   label: 'รายได้อื่นๆ รับรู้จากสินค้า',
    //   link: './not-light-product',
    //   exact: false
    // },
    {
      label: 'รายงานใหม่',
      link: './monthly-report',
      exact: false
    },
    {
      label: 'รายงานเดิม',
      link: './report',
      exact: false
    },

  ]
}

export const NOTLIGHT_PRODUCT_TAB_TOKEN = {
  tabList: [
    {
      label: 'รายละเอียด',
      link: '',
      exact: true
    },
    {
      label: 'รายเดือน',
      link: './monthly',
      exact: false
    },
    {
      label: 'ราย period',
      link: './period-order',
      exact: false
    }
  ]
}

export const NOTLIGHT_INVOICE_TAB_TOKEN = {
  tabList: [
    {
      label: 'รายละเอียด',
      link: '',
      exact: true
    },
    {
      label: 'รายเดือน',
      link: './monthly',
      exact: false
    },
    {
      label: 'ราย period',
      link: './period-invoice',
      exact: false
    }
  ]
}

export const LIGHT_TAB_TOKEN = {
  tabList: [
    {
      label: 'รายละเอียด',
      link: '',
      exact: true
    },
    {
      label: 'รายเดือน',
      link: './monthly',
      exact: false
    },
    {
      label: 'ราย period',
      link: './period-invoice',
      exact: false
    }
  ]
}

export const STOCK_ITEM_TOKEN = {
  tabList: [
    {
      label: 'เกณฑ์เดือนสั่งซื้อ',
      link: './',
      exact: true
    },
    {
      label: 'รายงาน',
      link: './report',
      exact: true
    },
  ]
}

export const QUOTA_ITEM_TOKEN = {
  tabList: [
    {
      label: 'เพิ่มโควต้า',
      link: './',
      exact: true
    },
    {
      label: 'รายการโควต้า',
      link: './good-list',
      exact: true
    },
    {
      label: 'โควต้ารายร้าน',
      link: './whole-list',
      exact: true
    }
  ]
}

const DISMISS_KEY = 'announcement-modal-dismiss-2026-05-13'
const fiveDaysFromNow = () => Date.now() + 120 * 24 * 60 * 60 * 1000
const setDismissed = setItem(DISMISS_KEY, fiveDaysFromNow)
const getDismissed = getItem<boolean, null>({
  praser: (data: any): boolean => data === true,
  fallback: null
})(DISMISS_KEY)

@Component({
  selector: 'app-purchase-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="form-wrapper">
      <ul class="nav nav-tabs" style="border: none">
        @for (tab of tabs; track $index) {
          <li class="nav-item">
            <a
              class="nav-link"
              [routerLink]="tab.link"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: tab.exact}"
              >{{tab.label}}</a
            >
          </li>
        }
      </ul>
      <div class="content">
        <router-outlet />
      </div>
    </div>

    <ng-template #announcementModal let-modal>
      <div class="modal-header">
        <h2>อัพเดตระบบรายได้อื่นๆ</h2>
      </div>
      <div class="modal-body">
        
      <!---->
        <h4>บัญชี</h4>
        <ul>
          <li>รายงานเพื่อแสดงยอดทีซื้อจากวันที่ของ supplier และวันที่รับเข้า</li>
          <li>เพิ่มคำอธิบายรายได้ในรายงานเพื่ออกเอกสาร</li>
          <li>สถานะของเอกสารเมื่อสรุปยอดบัญชี จะมีได้หลายสถานะ <br/>เช่น กรณีรายได้ 100 บาท ออกใบแจ้งหนี้ 50 บาท จะอยู่ในสถานะ รอออกใบแจ้งหนี้ และรอออกใบเสร้จรับเงินพร้อมกัน</li>
          <li>แก้ไข กรณีไม่สามารถลบใบแจ้งหนี้ได้</li>
        </ul>
        <!---->
        <h4>จัดซื้อ</h4>
        <ul>
          <li>เพิ่มตัวกรองตามกิจกรรม</li>
        </ul>
      <!---->
        <h4>อื่นๆ</h4>
        <ul>
          <li>กระบวนการทำงาน
            <ul>
              <li>
                เมื่อจัดซื้อเพิ่มรายเดือน บัญชีสามารถตั้งประมาณการเดือนนั้นได้ทันที ไม่ต้องรอ <u>"สรุปรอบบัญชี"</u> 
                <br/>แต่ยอดประมาณการมีโอกาสไม่ตรงเพราะไม่สามารถ confirm supplier ทุกเดือนได้
                <br/> ตราบใดที่ไม่สามารถ confirm supplier ภายในวันที่ 5 ของเดือน ประมาณการภายในวันที่ 5 จะไม่ตรง
              </li>
              <li>
                เมื่อจะเรียกเก็บรายได้จาก supplier ทางจัดซื้อต้องกดสรุปรอบบัญชี <u> มักจะเกิดหลังปิดรอบบัญชี</u>
                <br/> ทั้งสองหน่วยงานต้องมีระเบียบการปรับปรุงรายได้เรียกเก็บให้ชัดเจน 
                <ol>
                  <li>การแก้ไขยอดเดิมทำให้สับสน เพราะมีการตั้งประมาณการไปแล้ว</li>
                  <li>การลงยอดปรับปรุง ควรทำอย่างไร ภายในช่วงไหนของเดือน</li>
                </ol>                
              </li>
              <li>
                หลังจากปรับปรุงยอดเรียบร้อย จัดซื้อต้อง <u>"สรุปรอบบัญชี"</u> บัญชีจึงสามารถออกเอกสารได้
              </li>
            </ul>
          </li>
        </ul>
      </div>
      <div class="modal-footer">
        <button
          type="button"
          class="btn btn-info w-100"
          (click)="dismissAnnouncement(modal)"
        >
          ไม่แสดงอีก
        </button>
      </div>
    </ng-template>
  `,
  styles: `
    .form-wrapper {
      margin: auto;
      padding: 1rem;
      width: 100%;
      @media (min-width: 992px) {
        width: 920px;
      }
    }

    a.nav-link {
      color: black;
      border: none;
      margin: 0;
      &.active {
        background-color: #e0e0e0;
      }
    }

    div.content {
      background-color: #e0e0e0;
      padding: 1rem;
    }
  `
})
export class PurchaseLayoutComponent {
  private readonly token = inject(TAB_TOKEN)
  tabs = this.token.tabList

  private readonly modalServ = inject(NgbModal)
  private readonly announcementModal = viewChild<TemplateRef<any>>('announcementModal')

  constructor() {
    afterNextRender(() => {
      if (getDismissed() === null) {
        const ref = this.announcementModal()
        if (ref) this.modalServ.open(ref, { size: 'lg', backdrop: 'static', keyboard: false })
      }
    })
  }

  dismissAnnouncement(modal: any) {
    setDismissed(true)
    modal.close()
  }
}
