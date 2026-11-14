import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { ChallengeListComponent } from './challenges/challenge-list.component';
import { ChallengeDetailsComponent } from './challenges/challenge-details.component';
import { ChallengeFormComponent } from './challenges/challenge-form.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Apex Trial — головна' },
  { path: 'challenges', component: ChallengeListComponent, title: 'Apex Trial — каталог' },
  { path: 'challenges/new', component: ChallengeFormComponent, title: 'Apex Trial — новий челендж' },
  { path: 'challenges/:id/edit', component: ChallengeFormComponent, title: 'Apex Trial — редагування' },
  { path: 'challenges/:id', component: ChallengeDetailsComponent, title: 'Apex Trial — деталі' },
  { path: '**', redirectTo: 'challenges' },
];
