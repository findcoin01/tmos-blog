import { Component, ChangeDetectionStrategy, inject, computed, signal, OnInit, OnDestroy, AfterViewInit, ElementRef, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink, ParamMap } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import { PostService } from '../../services/post.service';
import { Post } from '../../models/post.model';

interface Heading {
  id: string;
  text: string;
}

declare var marked: any; // Declare the 'marked' library loaded from CDN

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
              <img [ngSrc]="p.imageUrl" [alt]="p.title" width="800" height="400" priority class="w-full h-64 object-cover">
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
    .prose {
      color: #374151;
    }
    .prose.dark\\:prose-invert {
        --tw-prose-body: #d1d5db;
        --tw-prose-headings: #f9fafb;
        --tw-prose-lead: #e5e7eb;
        --tw-prose-bold: #fff;
        --tw-prose-counters: #9ca3af;
        --tw-prose-bullets: #6b7280;
        --tw-prose-quotes: #f3f4f6;
        --tw-prose-quote-borders: #f472b6;
    }
    .prose p:first-child:not(.lead) { /* A bit of style for generated markdown */
        font-size: 1.125em;
        line-height: 1.6;
        color: #4b5563;
    }
    .dark .prose p:first-child:not(.lead) {
        color: #d1d5db;
    }
    .prose p.lead {
      font-size: 1.25em;
      line-height: 1.6;
      color: #4b5563;
      margin-bottom: 1.5em;
    }
     .dark .prose p.lead {
        color: #d1d5db;
     }
    .prose blockquote {
      border-left: 4px solid #f472b6;
      padding-left: 1em;
      margin-left: 0;
      font-style: italic;
      color: #6b7280;
    }
    .dark .prose blockquote {
        color: #d1d5db;
        border-left-color: #f472b6;
    }
    /* Ensure headings have a scroll margin to not be obscured by the fixed header */
    .prose h3 {
      scroll-margin-top: 100px;
    }
  `],
  imports: [NgOptimizedImage, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
      rootMargin: '-100px 0px -60% 0px', // Trigger when heading is near the top
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
