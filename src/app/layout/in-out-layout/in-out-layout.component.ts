import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-in-out-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
  <div class="form-wrapper">
  <ul class="nav nav-tabs" style="border: none">
    <li class="nav-item">
      <a
        class="nav-link"
        routerLink="./"
        routerLinkActive="active"
        queryParamsHandling="preserve"
        [routerLinkActiveOptions]="{ exact: true }"
        >ปฏิทินการจอง</a
      >
    </li>
    <li>
      <a
        routerLink="./list"
        routerLinkActive="active"
        class="nav-link"
        queryParamsHandling="preserve"
        >ข้อมูลประตู</a
      >
    </li>
    <li>
      <a
        routerLink="./query"
        routerLinkActive="active"
        class="nav-link"
        queryParamsHandling="preserve"
        >ค้นหาการจอง</a
      >
    </li>
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
export class InOutLayoutComponent {

}
