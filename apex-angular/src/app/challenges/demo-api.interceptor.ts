import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { defer, timer, mergeMap } from 'rxjs';
import { Challenge, ChallengeInput, demoChallenges } from './challenge';
import { challengeEndpoint } from './challenges.service';

const storageKey = 'apex-trial-angular-v1';

interface Catalog {
  nextId: number;
  entries: Challenge[];
}

export const demoApiInterceptor: HttpInterceptorFn = (request, next) => {
  const collection = request.url === challengeEndpoint;
  if (!collection && !request.url.startsWith(challengeEndpoint + '/')) {
    return next(request);
  }

  return timer(180).pipe(mergeMap(() => defer(() => {
    const raw = globalThis.localStorage.getItem(storageKey);
    const catalog: Catalog = raw ? JSON.parse(raw) : { nextId: 5, entries: [...demoChallenges] };
    const { entries } = catalog;
    const id = Number(request.url.slice(challengeEndpoint.length + 1));
    const index = entries.findIndex(item => item.id === id);
    const input = request.body as ChallengeInput;

    const respond = (body: Challenge | Challenge[] | null, status = 200) =>
      [new HttpResponse({ body, status, url: request.url })];

    if (collection && request.method === 'GET') {
      return respond(entries);
    }
    if (collection && request.method === 'POST') {
      const entry = { ...input, id: catalog.nextId++ };
      entries.push(entry);
      save(catalog);
      return respond(entry, 201);
    }
    if (index < 0) {
      throw new HttpErrorResponse({ status: 404, statusText: 'Not Found', url: request.url });
    }
    if (request.method === 'GET') {
      return respond(entries[index]);
    }
    if (request.method === 'PUT') {
      const entry = { ...input, id };
      entries[index] = entry;
      save(catalog);
      return respond(entry);
    }
    if (request.method === 'DELETE') {
      entries.splice(index, 1);
      save(catalog);
      return respond(null, 204);
    }
    throw new HttpErrorResponse({ status: 405, statusText: 'Method Not Allowed', url: request.url });
  })));
};

function save(catalog: Catalog) {
  globalThis.localStorage.setItem(storageKey, JSON.stringify(catalog));
}
