import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { demoChallenges } from './challenge';
import { ChallengesService, challengeEndpoint } from './challenges.service';

describe('ChallengesService', () => {
  let api: ChallengesService;
  let http: HttpTestingController;
  const [example] = demoChallenges;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(ChallengesService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads the list and returns the HTTP response', () => {
    const result = vi.fn();
    api.list().subscribe(result);
    http.expectOne({ method: 'GET', url: challengeEndpoint }).flush([example]);
    expect(result).toHaveBeenCalledWith([example]);
  });

  it('loads an entry by id', () => {
    api.get(example.id).subscribe();
    http.expectOne({ method: 'GET', url: challengeEndpoint + '/1' }).flush(example);
  });

  it('creates an entry and sends form data', () => {
    const { id, ...input } = example;
    api.create(input).subscribe();
    const request = http.expectOne({ method: 'POST', url: challengeEndpoint });
    expect(request.request.body).toEqual(input);
    request.flush({ ...input, id });
  });

  it('updates an existing entry', () => {
    const { id, ...input } = example;
    api.update(id, input).subscribe();
    const request = http.expectOne({ method: 'PUT', url: challengeEndpoint + '/1' });
    expect(request.request.body).toEqual(input);
    request.flush(example);
  });

  it('deletes an entry by id', () => {
    api.delete(1).subscribe();
    http.expectOne({ method: 'DELETE', url: challengeEndpoint + '/1' })
      .flush(null, { status: 204, statusText: 'No Content' });
  });
});
