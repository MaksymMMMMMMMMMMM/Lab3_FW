import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopBarComponent } from './top-bar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TopBarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-top-bar />
    <main class="shell" id="main"><router-outlet /></main>
    <footer class="shell footer">Apex Trial · Навчальний проєкт · Angular</footer>
  `,
})
export class AppComponent {}
