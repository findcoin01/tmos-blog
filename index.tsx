import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection, LOCALE_ID } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withFetch } from '@angular/common/http';
import localeZh from '@angular/common/locales/zh';

import { AppComponent } from './src/app.component';
import { routes } from './src/app.routes';

registerLocaleData(localeZh);

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withHashLocation()),
    provideHttpClient(withFetch()),
    { provide: LOCALE_ID, useValue: 'zh-CN' },
  ],
}).catch(err => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.