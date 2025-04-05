import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from "./components/toast/toast.component";
import { LoadingComponent } from "./components/loading/loading.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent, LoadingComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'dn-prochure';
}
