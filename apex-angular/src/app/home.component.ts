import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="hero">
      <div>
        <p class="kicker">Apex Trial</p>
        <h1>Каталог трейдингових челенджів</h1>
        <p class="intro">Порівняй формати 1-Step і 2-Step за розміром рахунку, ціною участі, цілями прибутку та лімітами збитку.</p>
        <a class="button primary" routerLink="/challenges">Відкрити каталог <span aria-hidden="true">↗</span></a>
      </div>
      <aside class="hero-panel" aria-label="Формати челенджів">
        <div><strong>1-Step</strong><span>Один етап оцінювання</span></div>
        <div><strong>2-Step</strong><span>Два етапи оцінювання</span></div>
        <p>Усі рахунки й умови в каталозі демонстраційні.</p>
      </aside>
    </section>
  `,
})
export class HomeComponent {}
