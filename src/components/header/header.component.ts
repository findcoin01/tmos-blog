import { Component, ChangeDetectionStrategy, inject, signal, viewChild, ElementRef, effect } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  template: `
    <header class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm fixed w-full top-0 z-50 shadow-sm transition-colors duration-300">
      <div class="container mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
          <div class="flex-1">
            <button (click)="toggleSearch()" 
                    class="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
                    aria-label="Toggle search">
              @if (isSearchVisible()) {
                <!-- Close Icon -->
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              } @else {
                <!-- Search Icon -->
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            </button>
          </div>
          
          <div class="flex-shrink-0 text-center transition-all duration-300">
            @if (!isSearchVisible()) {
              <div>
                <h1 class="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text mb-3">
                  TMOS
                </h1>
                <nav>
                  <ul class="flex space-x-6 justify-center">
                    <li>
                      <a routerLink="/home" 
                         routerLinkActive="text-pink-500 border-pink-400"
                         [routerLinkActiveOptions]="{ exact: true }"
                         class="text-gray-600 dark:text-gray-300 hover:text-pink-500 dark:hover:text-pink-400 transition-colors duration-300 font-medium pb-1 border-b-2 border-transparent">首页</a>
                    </li>
                    <li>
                      <a routerLink="/articles" 
                         routerLinkActive="text-pink-500 border-pink-400"
                         class="text-gray-600 dark:text-gray-300 hover:text-pink-500 dark:hover:text-pink-400 transition-colors duration-300 font-medium pb-1 border-b-2 border-transparent">文章</a>
                    </li>
                    <li>
                      <a routerLink="/gallery" 
                         routerLinkActive="text-pink-500 border-pink-400"
                         class="text-gray-600 dark:text-gray-300 hover:text-pink-500 dark:hover:text-pink-400 transition-colors duration-300 font-medium pb-1 border-b-2 border-transparent">相册</a>
                    </li>
                    <li>
                      <a routerLink="/archive" 
                         routerLinkActive="text-pink-500 border-pink-400"
                         class="text-gray-600 dark:text-gray-300 hover:text-pink-500 dark:hover:text-pink-400 transition-colors duration-300 font-medium pb-1 border-b-2 border-transparent">归档</a>
                    </li>
                    <li>
                      <a routerLink="/friends" 
                         routerLinkActive="text-pink-500 border-pink-400"
                         class="text-gray-600 dark:text-gray-300 hover:text-pink-500 dark:hover:text-pink-400 transition-colors duration-300 font-medium pb-1 border-b-2 border-transparent">友方</a>
                    </li>
                    <li>
                      <a routerLink="/about" 
                         routerLinkActive="text-pink-500 border-pink-400"
                         class="text-gray-600 dark:text-gray-300 hover:text-pink-500 dark:hover:text-pink-400 transition-colors duration-300 font-medium pb-1 border-b-2 border-transparent">关于</a>
                    </li>
                  </ul>
                </nav>
              </div>
            } @else {
              <div class="w-full px-4 animate-fade-in">
                <input #searchInput
                       type="text"
                       placeholder="搜索文章标题或摘要..."
                       (keyup.enter)="performSearch(searchInput.value)"
                       (blur)="isSearchVisible.set(false)"
                       class="w-64 md:w-96 bg-transparent text-center text-gray-800 dark:text-gray-200 placeholder-gray-500 focus:outline-none border-b-2 border-pink-400 py-2 transition-all duration-300" />
              </div>
            }
          </div>

          <div class="flex-1 flex justify-end">
            <button (click)="toggleTheme()" 
                    class="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
                    aria-label="Toggle theme">
              @if (themeService.theme() === 'dark') {
                <!-- Sun Icon -->
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              } @else {
                <!-- Moon Icon -->
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              }
            </button>
          </div>
        </div>
      </div>
    </header>
    <style>
      .animate-fade-in {
        animation: fadeIn 0.3s ease-out forwards;
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    </style>
  `,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  themeService = inject(ThemeService);
  // FIX: Explicitly type the injected Router to resolve the 'unknown' type error.
  private router: Router = inject(Router);

  isSearchVisible = signal(false);
  private searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  constructor() {
    effect(() => {
      if (this.isSearchVisible()) {
        // Delay focus to allow element to render and animation to start
        setTimeout(() => this.searchInput()?.nativeElement.focus(), 50);
      }
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleSearch(): void {
    this.isSearchVisible.update(v => !v);
  }

  performSearch(query: string): void {
    const trimmedQuery = query.trim();
    this.isSearchVisible.set(false);
    // Use null for query param if empty to remove it from URL
    this.router.navigate(['/articles'], { queryParams: { q: trimmedQuery || null } });
  }
}
