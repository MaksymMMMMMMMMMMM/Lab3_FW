import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';
import { ChallengeListComponent } from './challenge-list.component';
import { demoChallenges } from './challenge';
import { ChallengesService } from './challenges.service';

describe('ChallengeListComponent', () => {
  let fixture: ComponentFixture<ChallengeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChallengeListComponent],
      providers: [
        provideRouter([]),
        { provide: ChallengesService, useValue: { list: () => of([...demoChallenges]) } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ChallengeListComponent);
    fixture.detectChanges();
  });

  it('renders three cards per page and opens the second page', () => {
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelectorAll('article')).toHaveLength(3);
    const next = [...root.querySelectorAll('button')].find(button => button.textContent?.trim() === 'Далі');
    expect(next).toBeDefined();
    next?.click();
    fixture.detectChanges();
    expect(root.querySelectorAll('article')).toHaveLength(1);
    expect(root.querySelector('article h2')?.textContent).toContain('Apex 50K Classic');
  });

  it('filters by category and returns to the first page', () => {
    const root: HTMLElement = fixture.nativeElement;
    fixture.componentInstance.page.set(2);
    fixture.detectChanges();
    const select = root.querySelector('select')!;
    select.value = '2-Step';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(fixture.componentInstance.page()).toBe(1);
    expect(root.querySelectorAll('article')).toHaveLength(2);
    expect([...root.querySelectorAll('article .tag')].map(tag => tag.textContent?.trim())).toEqual(['2-Step', '2-Step']);
  });
});
