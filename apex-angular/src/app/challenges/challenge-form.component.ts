import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { categories, Category, ChallengeInput } from './challenge';
import { ChallengesService } from './challenges.service';

function validateRules(control: AbstractControl): ValidationErrors | null {
  const { category, secondTarget, dailyLoss, totalLoss } = control.value;
  const errors: ValidationErrors = {};
  if (category === '2-Step' && (secondTarget === null || secondTarget < 0.1 || secondTarget > 100)) {
    errors['secondTarget'] = true;
  }
  if (dailyLoss !== null && totalLoss !== null && dailyLoss > totalLoss) {
    errors['lossOrder'] = true;
  }
  return Object.keys(errors).length ? errors : null;
}

function validateName(control: AbstractControl): ValidationErrors | null {
  const name = String(control.value ?? '').trim();
  return name.length >= 3 ? null : { shortName: true };
}

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page narrow">
      <a class="back" [routerLink]="cancelLink">← {{ editing ? 'До деталей' : 'До каталогу' }}</a>
      <h1>{{ editing ? 'Редагування челенджу' : 'Новий челендж' }}</h1>
      @if (loading()) {
        <p role="status">Завантаження…</p>
      } @else if (!loadError()) {
        <form class="card form-panel" [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="form-grid">
            <label>Назва <input formControlName="name" maxlength="60" required></label>
            <label>Формат <select formControlName="category">
              @for (category of categories; track category) {
                <option [value]="category">{{ category }}</option>
              }
            </select></label>
            <label>Розмір рахунку, USD <input type="number" formControlName="account" min="1" step="1" required></label>
            <label>Вартість участі, USD <input type="number" formControlName="price" min="0" step="0.01" required></label>
            <label>Ціль етапу 1, % <input type="number" formControlName="target" min="0.1" max="100" step="0.1" required></label>
            @if (form.controls.category.value === '2-Step') {
              <label>Ціль етапу 2, % <input type="number" formControlName="secondTarget" min="0.1" max="100" step="0.1" required></label>
            }
            <label>Ліміт за день, % <input type="number" formControlName="dailyLoss" min="0.1" max="100" step="0.1" required></label>
            <label>Загальний ліміт, % <input type="number" formControlName="totalLoss" min="0.1" max="100" step="0.1" required></label>
            <label class="wide">Опис <textarea formControlName="description" rows="3" maxlength="240"></textarea></label>
          </div>
          @if (submitted() && form.invalid) {
            <div class="error" role="alert">
              <p>Перевір обов’язкові поля та допустимі значення.</p>
              @if (form.controls.name.invalid) { <p>Назва має містити від 3 до 60 символів.</p> }
              @if (form.hasError('secondTarget')) { <p>Для 2-Step задай ціль другого етапу від 0,1 до 100%.</p> }
              @if (form.hasError('lossOrder')) { <p>Денний ліміт має бути не більшим за загальний.</p> }
            </div>
          }
          @if (saveError()) {
            <p class="error" role="alert">{{ saveError() }}</p>
          }
          <div class="actions">
            <button class="button primary" type="submit" [disabled]="saving()">{{ saving() ? 'Збереження…' : 'Зберегти' }}</button>
            <a class="button" [routerLink]="cancelLink">Скасувати</a>
          </div>
        </form>
      } @else {
        <p class="error" role="alert">{{ loadError() }}</p>
      }
    </section>
  `,
})
export class ChallengeFormComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(ChallengesService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly id = this.route.snapshot.paramMap.get('id');
  readonly editing = this.id !== null;
  readonly cancelLink = this.editing ? ['/challenges', this.id] : ['/challenges'];
  readonly categories = categories;
  readonly loading = signal(this.editing);
  readonly saving = signal(false);
  readonly submitted = signal(false);
  readonly loadError = signal('');
  readonly saveError = signal('');
  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [validateName, Validators.maxLength(60)] }),
    category: new FormControl<Category>('1-Step', { nonNullable: true }),
    account: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    price: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    target: this.percentControl(),
    secondTarget: new FormControl<number | null>(null),
    dailyLoss: this.percentControl(),
    totalLoss: this.percentControl(),
    description: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(240)] }),
  }, { validators: validateRules });

  constructor() {
    if (this.editing) {
      this.service.get(Number(this.id)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: entry => {
          this.form.patchValue(entry);
          this.loading.set(false);
        },
        error: (error: Error) => {
          this.loadError.set(error.message);
          this.loading.set(false);
        },
      });
    }
  }

  submit() {
    if (this.saving()) return;
    this.submitted.set(true);
    this.form.markAllAsTouched();
    const { name, category, account, price, target, secondTarget, dailyLoss, totalLoss, description } = this.form.getRawValue();
    if (this.form.invalid || account === null || price === null || target === null || dailyLoss === null || totalLoss === null) return;

    const input: ChallengeInput = {
      name: name.trim(), category, account, price, target, secondTarget: category === '2-Step' ? secondTarget : null,
      dailyLoss, totalLoss, description: description.trim(),
    };
    this.saving.set(true);
    this.saveError.set('');
    const request = this.editing ? this.service.update(Number(this.id), input) : this.service.create(input);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: entry => void this.router.navigate(['/challenges', entry.id]),
      error: (error: Error) => {
        this.saveError.set(error.message);
        this.saving.set(false);
      },
    });
  }

  private percentControl() {
    return new FormControl<number | null>(null, [Validators.required, Validators.min(0.1), Validators.max(100)]);
  }
}
