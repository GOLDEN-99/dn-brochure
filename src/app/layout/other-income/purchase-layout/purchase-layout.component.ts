import { Component, inject, InjectionToken } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

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
  private token = inject(TAB_TOKEN)
  tabs = this.token.tabList
}
