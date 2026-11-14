import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { requestLogInterceptor } from './app/challenges/request-log.interceptor';
import { demoApiInterceptor } from './app/challenges/demo-api.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([requestLogInterceptor, demoApiInterceptor])),
  ],
}).catch(console.error);
