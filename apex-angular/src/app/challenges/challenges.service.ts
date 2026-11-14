import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Challenge, ChallengeInput } from './challenge';

export const challengeEndpoint = '/api/challenges';

@Injectable({ providedIn: 'root' })
export class ChallengesService {
  private readonly http = inject(HttpClient);

  list() {
    return this.http.get<Challenge[]>(challengeEndpoint);
  }

  get(id: number) {
    return this.http.get<Challenge>(`${challengeEndpoint}/${id}`);
  }

  create(challenge: ChallengeInput) {
    return this.http.post<Challenge>(challengeEndpoint, challenge);
  }

  update(id: number, challenge: ChallengeInput) {
    return this.http.put<Challenge>(`${challengeEndpoint}/${id}`, challenge);
  }

  delete(id: number) {
    return this.http.delete<void>(`${challengeEndpoint}/${id}`);
  }
}
