import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { categories, Category, Challenge } from './challenge';
import { ChallengesService } from './challenges.service';

@Component({
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page">
      <div class="heading">
        <div><p class="kicker">Apex Trial</p><h1>Челенджі</h1></div>
        <a class="button primary" routerLink="/challenges/new">Додати челендж</a>
      </div>
      <div class="filters">
        <label for="category">Формат</label>
        <select id="category" #filter (change)="selectCategory(filter.value)">
          <option value="">Усі формати</option>
          @for (option of categories; track option) {
            <option [value]="option">{{ option }}</option>
          }
        </select>
        @if (!loading() && !error()) {
          <span class="muted" aria-live="polite">Усього {{ filtered().length }}</span>
        }
      </div>
      @if (loading()) {
        <p role="status">Завантаження каталогу…</p>
      } @else if (error()) {
        <p class="error" role="alert">{{ error() }}</p>
        <button class="button" type="button" (click)="load()">Повторити</button>
      } @else {
        <div class="grid">
          @for (entry of visible(); track entry.id) {
            <article class="card">
              <span class="tag">{{ entry.category }}</span>
              <h2>{{ entry.name }}</h2>
              <div class="balance">{{ entry.account | currency:'USD':'symbol':'1.0-0' }}</div>
              <dl class="metrics">
                <div><dt>Ціль прибутку</dt><dd>{{ entry.target }}% @if (entry.secondTarget !== null) { / {{ entry.secondTarget }}% }</dd></div>
                <div><dt>Ліміт за день</dt><dd>{{ entry.dailyLoss }}%</dd></div>
                <div><dt>Загальний ліміт</dt><dd>{{ entry.totalLoss }}%</dd></div>
              </dl>
              <div class="card-footer">
                <strong>{{ entry.price | currency:'USD':'symbol':'1.0-2' }}</strong>
                <a class="button" [routerLink]="['/challenges', entry.id]" [attr.aria-label]="'Деталі ' + entry.name">Деталі</a>
              </div>
            </article>
          } @empty {
            <p class="muted">За цим фільтром челенджів немає.</p>
          }
        </div>
        @if (pageCount() > 1) {
          <nav class="pagination" aria-label="Сторінки каталогу">
            <button class="button" type="button" [disabled]="page() === 1" (click)="page.set(page() - 1)">Назад</button>
            <span>Сторінка {{ page() }} з {{ pageCount() }}</span>
            <button class="button" type="button" [disabled]="page() === pageCount()" (click)="page.set(page() + 1)">Далі</button>
          </nav>
        }
      }
    </section>
  `,
})
export class ChallengeListComponent {
  private readonly service = inject(ChallengesService);
  private readonly entries = signal<Challenge[]>([]);
  private readonly category = signal<Category | ''>('');
  private readonly pageSize = 3;
  private readonly destroyRef = inject(DestroyRef);
  readonly categories = categories;
  readonly loading = signal(true);
  readonly error = signal('');
  readonly page = signal(1);
  readonly filtered = computed(() => this.entries().filter(entry => !this.category() || entry.category === this.category()));
  readonly pageCount = computed(() => Math.ceil(this.filtered().length / this.pageSize));
  readonly visible = computed(() => this.filtered().slice((this.page() - 1) * this.pageSize, this.page() * this.pageSize));

  constructor() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set('');
    this.service.list().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: entries => {
        this.entries.set(entries);
        this.page.set(1);
        this.loading.set(false);
      },
      error: (error: Error) => {
        this.error.set(error.message);
        this.loading.set(false);
      },
    });
  }

  selectCategory(value: string) {
    this.category.set(value === '1-Step' || value === '2-Step' ? value : '');
    this.page.set(1);
  }
}
