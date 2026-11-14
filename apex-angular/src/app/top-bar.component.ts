import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="top-bar">
      <div class="shell nav">
        <a class="brand" routerLink="/" aria-label="Apex Trial — головна">APEX <span>/</span> TRIAL</a>
        <nav aria-label="Основне меню">
          <a routerLink="/" routerLinkActive="current" ariaCurrentWhenActive="page" [routerLinkActiveOptions]="{ exact: true }">Головна</a>
          <a routerLink="/challenges" routerLinkActive="current" ariaCurrentWhenActive="page">Каталог</a>
        </nav>
      </div>
    </header>
  `,
})
export class TopBarComponent {}
