import { Component, ChangeDetectionStrategy, inject, signal, viewChild, ElementRef, effect, viewChildren } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  template: `
    <header 
            class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm fixed w-full top-0 z-50 shadow-sm transition-all duration-300">
      <div class="container mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
          <div class="flex-1">
            <button (click)="!isSearchVisible() ? openSearch() : closeSearch()" 
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
                
                <!-- Desktop Navigation -->
                <nav class="hidden lg:block">
                  <div class="relative" (mouseleave)="resetUnderline()">
                    <ul class="flex space-x-6 justify-center">
                      <li>
                        <a #navLink routerLink="/home" 
                           routerLinkActive="text-pink-500"
                           [routerLinkActiveOptions]="{ exact: true }"
                           (mouseenter)="moveUnderline($event.currentTarget)"
                           class="nav-link">首页</a>
                      </li>
                      <li>
                        <a #navLink routerLink="/articles" routerLinkActive="text-pink-500" (mouseenter)="moveUnderline($event.currentTarget)" class="nav-link">文章</a>
                      </li>
                      <li>
                        <a #navLink routerLink="/gallery" routerLinkActive="text-pink-500" (mouseenter)="moveUnderline($event.currentTarget)" class="nav-link">相册</a>
                      </li>
                      <li>
                        <a #navLink routerLink="/archive" routerLinkActive="text-pink-500" (mouseenter)="moveUnderline($event.currentTarget)" class="nav-link">归档</a>
                      </li>
                      <li>
                        <a #navLink routerLink="/friends" routerLinkActive="text-pink-500" (mouseenter)="moveUnderline($event.currentTarget)" class="nav-link">友链</a>
                      </li>
                      <li>
                        <a #navLink routerLink="/about" routerLinkActive="text-pink-500" (mouseenter)="moveUnderline($event.currentTarget)" class="nav-link">关于</a>
                      </li>
                    </ul>
                     <div class="magic-underline"
                         [style.left]="underlineStyle().left"
                         [style.width]="underlineStyle().width"
                         [style.opacity]="underlineStyle().opacity"></div>
                  </div>
                </nav>

                <!-- Mobile Navigation -->
                <nav class="lg:hidden">
                   <ul class="flex items-center space-x-4 justify-center">
                      <li>
                        <a routerLink="/home" routerLinkActive="text-pink-500" [routerLinkActiveOptions]="{ exact: true }" class="nav-link">首页</a>
                      </li>
                      <li>
                        <a routerLink="/articles" routerLinkActive="text-pink-500" class="nav-link">文章</a>
                      </li>
                      <li class="relative">
                        <button #moreMenuButton (click)="toggleMoreMenu()" class="nav-link flex items-center">
                          更多
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1 transition-transform duration-200" [class.rotate-180]="isMoreMenuOpen()" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                          </svg>
                        </button>

                        @if (isMoreMenuOpen()) {
                           <div #moreMenuDropdown class="absolute right-0 mt-2 w-20 bg-white dark:bg-gray-800 rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 z-20 animate-fade-in-down">
                              <ul class="p-2 space-y-1">
                                <li>
                                  <a routerLink="/gallery" routerLinkActive="active-mobile-link" (click)="closeMoreMenu()" class="mobile-nav-link group">
                                    <span class="transition-transform duration-200 ease-in-out group-hover:translate-x-1">相册</span>
                                  </a>
                                </li>
                                <li>
                                  <a routerLink="/archive" routerLinkActive="active-mobile-link" (click)="closeMoreMenu()" class="mobile-nav-link group">
                                    <span class="transition-transform duration-200 ease-in-out group-hover:translate-x-1">归档</span>
                                  </a>
                                </li>
                                <li>
                                  <a routerLink="/friends" routerLinkActive="active-mobile-link" (click)="closeMoreMenu()" class="mobile-nav-link group">
                                    <span class="transition-transform duration-200 ease-in-out group-hover:translate-x-1">友链</span>
                                  </a>
                                </li>
                                <li>
                                  <a routerLink="/about" routerLinkActive="active-mobile-link" (click)="closeMoreMenu()" class="mobile-nav-link group">
                                    <span class="transition-transform duration-200 ease-in-out group-hover:translate-x-1">关于</span>
                                  </a>
                                </li>
                              </ul>
                           </div>
                        }
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
                       (blur)="closeSearch()"
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
      .nav-link {
        @apply text-gray-600 dark:text-gray-300 hover:text-pink-500 dark:hover:text-pink-400 transition-colors duration-300 font-medium pb-2;
      }
      .mobile-nav-link {
        @apply flex items-center w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-300 rounded-lg;
        @apply hover:bg-pink-50 dark:hover:bg-pink-900/40 hover:text-pink-500 dark:hover:text-pink-400;
        @apply transition-all duration-200;
      }
      .active-mobile-link {
        @apply font-semibold text-pink-500 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/40;
      }
      .animate-fade-in {
        animation: fadeIn 0.3s ease-out forwards;
      }
      .animate-fade-in-down {
        animation: fadeInDown 0.2s ease-out forwards;
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes fadeInDown {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .magic-underline {
        position: absolute;
        bottom: 0px;
        height: 2px;
        background-image: linear-gradient(to right, #a855f7, #ec4899); /* from-purple-500 to-pink-500 */
        border-radius: 9999px;
        transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      }
    </style>
  `,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
  }
})
export class HeaderComponent {
  themeService = inject(ThemeService);
  private router: Router = inject(Router);

  isSearchVisible = signal(false);
  isMoreMenuOpen = signal(false);
  
  private searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private moreMenuButton = viewChild<ElementRef>('moreMenuButton');
  private moreMenuDropdown = viewChild<ElementRef>('moreMenuDropdown');

  // --- Magic Underline Logic ---
  private navLinks = viewChildren<ElementRef<HTMLAnchorElement>>('navLink');
  underlineStyle = signal({ left: '0px', width: '0px', opacity: '0' });

  constructor() {
    effect(() => {
      if (this.isSearchVisible()) {
        // Delay focus to allow element to render and animation to start
        setTimeout(() => this.searchInput()?.nativeElement.focus(), 50);
      }
    });

    // Effect for magic underline initialization and route changes
    effect(() => {
      this.navLinks(); // Depend on the query list
      // Wait for a tick for routerLinkActive to apply classes, then reset.
      setTimeout(() => this.resetUnderline(), 50);
    });
  }
  
  onDocumentClick(event: MouseEvent): void {
    if (this.isMoreMenuOpen() &&
        !this.moreMenuButton()?.nativeElement.contains(event.target as Node) &&
        !this.moreMenuDropdown()?.nativeElement.contains(event.target as Node)) {
      this.closeMoreMenu();
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  openSearch(): void {
    this.isSearchVisible.set(true);
  }

  closeSearch(): void {
    this.isSearchVisible.set(false);
  }
  
  toggleMoreMenu(): void {
    this.isMoreMenuOpen.update(v => !v);
  }

  closeMoreMenu(): void {
    this.isMoreMenuOpen.set(false);
  }

  performSearch(query: string): void {
    const trimmedQuery = query.trim();
    this.closeSearch();
    // Use null for query param if empty to remove it from URL
    this.router.navigate(['/articles'], { queryParams: { q: trimmedQuery || null } });
  }

  // --- Magic Underline Methods ---
  moveUnderline(element: HTMLElement): void {
    if (!element) return;
    this.underlineStyle.set({
      left: `${element.offsetLeft}px`,
      width: `${element.offsetWidth}px`,
      opacity: '1'
    });
  }

  resetUnderline(): void {
    // Check if search is visible or screen is small, if so, do nothing.
    if (this.isSearchVisible() || window.innerWidth < 430) {
      this.underlineStyle.update(style => ({ ...style, opacity: '0' }));
      return;
    };

    const activeLink = this.navLinks().find(linkRef =>
      linkRef.nativeElement.classList.contains('text-pink-500')
    );

    if (activeLink) {
      this.moveUnderline(activeLink.nativeElement);
    } else {
      // Hide underline if no active link is found
      this.underlineStyle.update(style => ({ ...style, opacity: '0' }));
    }
  }
}