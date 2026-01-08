import { Component, ChangeDetectionStrategy, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { ThemeService } from './services/theme.service';
import { LoadingScreenComponent } from './components/loading-screen/loading-screen.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, LoadingScreenComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  // Inject to initialize the service
  private themeService = inject(ThemeService);
  private platformId = inject(PLATFORM_ID);

  // Signal to control the loading screen visibility
  isFirstLoad = signal(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      // Only run this logic in the browser for the first visit per session
      if (!sessionStorage.getItem('hasVisited')) {
        this.isFirstLoad.set(true);

        const minAnimationTime = 1500; // Minimum display time: 1.5s for aesthetics

        // We will use Promise.all to wait for both conditions:
        // 1. The window 'load' event has fired, meaning resources are rendered.
        // 2. A minimum time has passed for the animation to be appreciated.
        
        const pageLoadPromise = new Promise<void>(resolve => {
          if (document.readyState === 'complete') {
            resolve();
          } else {
            window.addEventListener('load', () => resolve(), { once: true });
          }
        });

        const minTimePromise = new Promise<void>(resolve => {
          setTimeout(resolve, minAnimationTime);
        });

        Promise.all([pageLoadPromise, minTimePromise]).then(() => {
          this.isFirstLoad.set(false);
          sessionStorage.setItem('hasVisited', 'true');
        });
      }
    }
  }
}