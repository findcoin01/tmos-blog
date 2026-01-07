import { Component, ChangeDetectionStrategy, inject, computed, signal, OnInit, OnDestroy, AfterViewInit, ElementRef, SecurityContext, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink, ParamMap } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { marked } from 'marked';

import { PostService } from '../../services/post.service';
import { Post } from '../../models/post.model';

interface Heading {
  id: string;
  text: string;
}

@Component({
  selector: 'app-post',
  template: `
    <!-- Reading Progress Bar -->
    <div class="fixed top-0 left-0 w-full h-1 z-[100] pointer-events-none">
      <div class="h-1 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-75 ease-linear" [style.width.%]="scrollProgress()"></div>
    </div>
    
    <div class="flex flex-col lg:flex-row lg:space-x-8">

      <!-- Main Article Content -->
      <div class="w-full lg:w-3/4">
        @if (post(); as p) {
          <article class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <header>
              @if(isLocalUrl(p.imageUrl)) {
                <img [src]="p.imageUrl" [alt]="p.title" width="800" height="400" class="w-full h-64 object-cover">
              } @else {
                <img [ngSrc]="p.imageUrl" [alt]="p.title" width="800" height="400" priority class="w-full h-64 object-cover">
              }
              <div class="p-6 md:p-8">
                <h1 class="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">{{ p.title }}</h1>
                <div class="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                  <img [ngSrc]="p.authorAvatarUrl" alt="Author" width="40" height="40" class="w-10 h-10 rounded-full mr-3"/>
                  <div>
                    <p class="font-semibold text-gray-700 dark:text-gray-300">{{ p.author }}</p>
                    <p>{{ p.publishDate }}</p>
                  </div>
                </div>
              </div>
            </header>

            <div 
              #articleContent 
              class="prose dark:prose-invert max-w-none p-6 md:p-8 border-t dark:border-gray-700"
              [innerHTML]="sanitizedPostContent()">
            </div>

            <footer class="p-6 md:p-8 border-t dark:border-gray-700 flex flex-wrap gap-2">
              @for (tag of p.tags; track tag) {
                <span class="px-3 py-1 text-xs font-medium rounded-full" [class]="getTagColor(tag)">
                  {{ tag }}
                </span>
              }
            </footer>
          </article>
        } @else if (post() === null) {
          <div class="text-center p-8">
            <p class="text-gray-500 dark:text-gray-400">文章未找到。</p>
          </div>
        } @else {
          <div class="text-center p-8">
            <p class="text-gray-500 dark:text-gray-400">正在加载文章...</p>
          </div>
        }
      </div>

      <!-- Table of Contents Sidebar -->
      <aside class="hidden lg:block w-full lg:w-1/4">
        @if (headings().length > 0) {
          <div class="sticky top-32 p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl shadow-md">
              <h4 class="text-lg font-bold text-gray-700 dark:text-gray-200 mb-4">目录</h4>
              <ul class="space-y-2">
                @for (heading of headings(); track heading.id) {
                  <li>
                    <a [href]="'#' + heading.id"
                       (click)="scrollToHeading($event, heading.id)"
                       class="block text-sm transition-colors duration-200 border-l-2 pl-3"
                       [class]="activeHeadingId() === heading.id 
                                ? 'text-pink-500 dark:text-pink-400 border-pink-500 font-semibold' 
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border-transparent'">
                      {{ heading.text }}
                    </a>
                  </li>
                }
              </ul>
          </div>
        }
      </aside>

    </div>


    <div class="mt-8 text-center">
        <a routerLink="/articles" class="text-pink-500 hover:text-pink-600 dark:text-pink-400 dark:hover:text-pink-300 transition-colors font-medium">
            &larr; 返回文章列表
        </a>
    </div>
  `,
  styles: [`
    /* --- Redesigned Markdown Content Styles v2 --- */
    
    /* General prose styling */
    app-post .prose {
      line-height: 1.8;
      font-size: 1.05rem; /* Slightly larger base font size for readability */
      color: #374151; /* gray-700 */
    }
    html.dark app-post .prose {
      color: #d1d5db; /* gray-300 */
    }

    /* Headings */
    app-post .prose h3 {
        scroll-margin-top: 150px; /* Offset for fixed header */
        display: flex;
        align-items: center;
        padding-bottom: 0.6em;
        margin-top: 2em;
        margin-bottom: 1em;
        border-bottom: 2px dashed #e9d5ff; /* purple-200 */
        font-size: 1.5em;
        font-weight: 700;
        color: #581c87; /* purple-900 */
    }
    html.dark app-post .prose h3 {
        border-bottom-color: #4c1d95; /* purple-800 */
        color: #d8b4fe; /* purple-300 */
    }
    app-post .prose h3::before {
        content: '🌸'; /* Cherry blossom icon */
        margin-right: 0.5em;
        font-size: 0.9em;
        transform: translateY(-2px); /* Vertical alignment fix */
    }

    /* Links */
    app-post .prose a {
        color: #c026d3; /* fuchsia-600 */
        text-decoration: none;
        background-image: linear-gradient(to right, #a855f7, #ec4899);
        background-size: 0% 2px;
        background-repeat: no-repeat;
        background-position: left bottom;
        transition: background-size 0.3s ease-out;
        font-weight: 500;
    }
    app-post .prose a:hover {
        background-size: 100% 2px;
    }
    html.dark app-post .prose a {
        color: #f0abfc; /* fuchsia-300 */
    }

    /* Blockquotes as Callouts */
    app-post .prose blockquote {
        margin: 1.5em 0;
        padding: 1em 1.5em 1em 3.5em;
        border-left: 4px solid #f472b6; /* pink-400 */
        background-color: #fdf2f8; /* pink-50 */
        border-radius: 8px;
        position: relative;
        font-style: normal;
        font-size: 0.95em;
        color: #504455;
    }
    app-post .prose blockquote::before {
        content: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="%23db2777"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>');
        position: absolute;
        left: 1em;
        top: 1.2em;
        width: 20px;
        height: 20px;
        opacity: 0.8;
    }
    html.dark app-post .prose blockquote {
        background-color: #262131;
        border-left-color: #f9a8d4; /* pink-300 */
        color: #d1d5db;
    }
    html.dark app-post .prose blockquote::before {
        content: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="%23f9a8d4"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>');
    }
    app-post .prose blockquote p:first-of-type { margin-top: 0; }
    app-post .prose blockquote p:last-of-type { margin-bottom: 0; }

    /* Horizontal Rule */
    app-post .prose hr {
        border: 0;
        text-align: center;
        margin: 3em 0;
    }
    app-post .prose hr::before {
        content: '...';
        letter-spacing: 0.6em;
        font-size: 1.5em;
        color: #d8b4fe; /* purple-300 */
    }
    html.dark app-post .prose hr::before {
        color: #581c87; /* purple-900 */
    }

    /* Lists */
    app-post .prose ul, app-post .prose ol {
        padding-left: 1.5em;
    }
    app-post .prose li {
        padding-left: 0.5em;
        margin-top: 0.75em;
    }
    app-post .prose ul > li::marker {
        color: #a855f7; /* purple-500 */
    }
    html.dark app-post .prose ul > li::marker {
        color: #d8b4fe; /* purple-300 */
    }

    /* Code blocks */
    app-post .prose code {
        background-color: #f3e8ff; /* purple-100 */
        color: #9333ea; /* purple-600 */
        border-radius: 4px;
        padding: 0.2em 0.4em;
        font-size: 0.9em;
        font-family: 'Fira Code', 'JetBrains Mono', monospace;
    }
    html.dark app-post .prose code {
        background-color: #3730a3; /* indigo-800 */
        color: #c7d2fe; /* indigo-200 */
    }
    app-post .prose pre {
        background-color: #2d3748; /* gray-800 */
        border-radius: 8px;
        padding: 1em;
        overflow-x: auto;
        font-size: 0.9em;
        margin: 1.5em 0;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -2px rgba(0,0,0,.1);
    }
    html.dark app-post .prose pre {
        background-color: #1a202c; /* gray-900 */
    }
    app-post .prose pre code {
        background-color: transparent;
        color: #e2e8f0; /* gray-300 */
        padding: 0;
        font-size: inherit;
        font-family: inherit;
    }
    html.dark app-post .prose pre code {
        color: #cbd5e1; /* gray-400 */
    }

    /* Images and Captions */
    app-post .prose img {
        border-radius: 12px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        margin-top: 2em;
        margin-bottom: 0.5em;
    }
    app-post .prose img + em {
        display: block;
        text-align: center;
        font-size: 0.9em;
        color: #6b7280; /* gray-500 */
        font-style: italic;
    }
    html.dark app-post .prose img + em {
        color: #9ca3af; /* gray-400 */
    }
  `],
  imports: [NgOptimizedImage, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PostComponent implements OnInit, OnDestroy, AfterViewInit {
  // FIX: Explicitly type injected services to resolve 'unknown' type errors.
  private route: ActivatedRoute = inject(ActivatedRoute);
  private postService: PostService = inject(PostService);
  private elementRef: ElementRef = inject(ElementRef);
  private sanitizer: DomSanitizer = inject(DomSanitizer);
  private observer?: IntersectionObserver;

  scrollProgress = signal(0);
  headings = signal<Heading[]>([]);
  activeHeadingId = signal('');

  private postId = toSignal(
    this.route.paramMap.pipe(map((params: ParamMap) => Number(params.get('id'))))
  );

  post = computed<Post | null | undefined>(() => {
    const id = this.postId();
    if (id === undefined) {
      return undefined; // Loading state while waiting for route parameters
    }
    // FIX: Coerce potential 'unknown' route parameter to a number for safe use with isNaN and getPostById.
    const numericId = Number(id);
    if (isNaN(numericId) || numericId === 0) {
      return null; // Not-found state
    }
    const foundPost = this.postService.getPostById(numericId);
    return foundPost ?? null; // Not-found state if service returns undefined
  });

  sanitizedPostContent = computed(() => {
    const content = this.post()?.content;
    if (!content) return '';
    // Use the 'marked' library to parse markdown to HTML
    const html = marked.parse(content);
    // Sanitize the HTML before binding to prevent security risks
    return this.sanitizer.bypassSecurityTrustHtml(html as string);
  });

  ngOnInit(): void {
    window.addEventListener('scroll', this.onScroll, { passive: true });
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onScroll);
    this.observer?.disconnect();
  }

  ngAfterViewInit(): void {
    // We need a short delay to ensure the content is rendered, especially the `<h3>`s.
    setTimeout(() => {
      this.createTableOfContents();
      this.setupIntersectionObserver();
    }, 100); // Increased delay slightly for markdown rendering
  }
  
  private createTableOfContents(): void {
    const contentEl = this.elementRef.nativeElement.querySelector('.prose');
    if (!contentEl) return;

    const headingNodes: NodeListOf<HTMLHeadingElement> = contentEl.querySelectorAll('h3');
    const headingsData: Heading[] = [];
    
    headingNodes.forEach((node, index) => {
      const text = node.textContent?.trim() || '';
      // FIX: Corrected regex to replace whitespace with a dash for the ID.
      const id = text.toLowerCase().replace(/\s+/g, '-') + `-${index}`;
      node.id = id;
      headingsData.push({ id, text });
    });

    this.headings.set(headingsData);
  }

  private setupIntersectionObserver(): void {
    const options = {
      rootMargin: '-150px 0px -60% 0px', // Trigger when heading is near the top to account for fixed header
      threshold: 0,
    };
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.activeHeadingId.set(entry.target.id);
        }
      });
    }, options);
    
    const headingElements = this.elementRef.nativeElement.querySelectorAll('.prose h3');
    headingElements.forEach((el: Element) => this.observer?.observe(el));
  }
  
  scrollToHeading(event: MouseEvent, id: string): void {
    event.preventDefault();
    const element = this.elementRef.nativeElement.querySelector(`#${id}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // This provides a better UX by updating URL hash, allowing back/forward navigation and link sharing
    history.pushState(null, '', `#${id}`);
  }

  isLocalUrl(url: string): boolean {
    return !url.startsWith('http');
  }

  onScroll = (): void => {
    const el = document.documentElement;
    const scrollTop = el.scrollTop;
    const scrollHeight = el.scrollHeight;
    const clientHeight = el.clientHeight;

    if (scrollHeight <= clientHeight) {
      this.scrollProgress.set(0);
      return;
    }

    const scrolled = (scrollTop / (scrollHeight - clientHeight)) * 100;
    this.scrollProgress.set(scrolled);
  };
  
  getTagColor(tag: string): string {
    const colors: { [key: string]: string } = {
      '日常': 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300',
      '技术': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
      '旅行': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
      'AI': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
      '新文章': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    };
    return colors[tag] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
}