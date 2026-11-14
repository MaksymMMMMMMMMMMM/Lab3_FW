import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
import { Challenge } from './challenge';
import { ChallengesService } from './challenges.service';

type DetailsState =
  | { status: 'loading' }
  | { status: 'ready'; entry: Challenge }
  | { status: 'error'; message: string };

@Component({
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page narrow">
      <a class="back" routerLink="/challenges">← До каталогу</a>
      @let view = state();
      @if (view.status === 'loading') {
          <h1>Деталі челенджу</h1>
          <p role="status">Завантаження…</p>
      } @else if (view.status === 'error') {
          <h1>Деталі челенджу</h1>
          <p class="error" role="alert">{{ view.message }}</p>
      } @else {
          <article class="detail card">
            <span class="tag">{{ view.entry.category }}</span>
            <h1>{{ view.entry.name }}</h1>
            <p class="muted">{{ view.entry.description }}</p>
            <dl class="metrics">
              <div><dt>Розмір рахунку</dt><dd>{{ view.entry.account | currency:'USD':'symbol':'1.0-0' }}</dd></div>
              <div><dt>Вартість участі</dt><dd>{{ view.entry.price | currency:'USD':'symbol':'1.0-2' }}</dd></div>
              <div><dt>Ціль етапу 1</dt><dd>{{ view.entry.target }}%</dd></div>
              @if (view.entry.secondTarget !== null) {
                <div><dt>Ціль етапу 2</dt><dd>{{ view.entry.secondTarget }}%</dd></div>
              }
              <div><dt>Ліміт за день</dt><dd>{{ view.entry.dailyLoss }}%</dd></div>
              <div><dt>Загальний ліміт</dt><dd>{{ view.entry.totalLoss }}%</dd></div>
            </dl>
            <div class="actions">
              @if (confirming()) {
                <strong>Видалити цей челендж?</strong>
                <button type="button" class="button danger" [disabled]="deleting()" (click)="remove(view.entry.id)">Підтвердити видалення</button>
                <button type="button" class="button" [disabled]="deleting()" (click)="confirming.set(false)">Скасувати</button>
              } @else {
                <a class="button primary" [routerLink]="['/challenges', view.entry.id, 'edit']">Редагувати</a>
                <button type="button" class="button danger" (click)="confirming.set(true)">Видалити</button>
              }
            </div>
            @if (deleteError()) {
              <p class="error" role="alert">{{ deleteError() }}</p>
            }
          </article>
      }
    </section>
  `,
})
export class ChallengeDetailsComponent {
  private readonly service = inject(ChallengesService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  readonly state = signal<DetailsState>({ status: 'loading' });
  readonly confirming = signal(false);
  readonly deleting = signal(false);
  readonly deleteError = signal('');

  constructor() {
    this.route.paramMap.pipe(
      switchMap(params => {
        this.state.set({ status: 'loading' });
        this.confirming.set(false);
        this.deleteError.set('');
        return this.service.get(Number(params.get('id'))).pipe(
          map((entry): DetailsState => ({ status: 'ready', entry })),
          catchError((error: Error) => of<DetailsState>({ status: 'error', message: error.message })),
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(state => this.state.set(state));
  }

  remove(id: number) {
    this.deleting.set(true);
    this.deleteError.set('');
    this.service.delete(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => void this.router.navigate(['/challenges']),
      error: (error: Error) => {
        this.deleteError.set(error.message);
        this.deleting.set(false);
      },
    });
  }
}
