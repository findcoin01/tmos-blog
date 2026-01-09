import { Component, ChangeDetectionStrategy, inject, computed, signal, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PostService } from '../../services/post.service';
import { Post } from '../../models/post.model';

interface MonthlyPosts {
  [monthKey: string]: Post[];
}

interface YearlyPosts {
  [yearKey: string]: MonthlyPosts;
}

@Component({
  selector: 'app-archive',
  templateUrl: './archive.component.html',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArchiveComponent implements AfterViewInit, OnDestroy {
  private postService = inject(PostService);
  private elementRef = inject(ElementRef);
  private observer?: IntersectionObserver;

  allPosts = this.postService.posts;
  activeMonth = signal<string>('');
  selectedTag = signal<string | null>(null);
  showScrollToTop = signal(false);

  allTags = computed(() => {
    const tags = new Set<string>();
    this.allPosts().forEach(post => {
      post.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  });

  filteredPosts = computed(() => {
    const tag = this.selectedTag();
    if (!tag) {
      return this.allPosts();
    }
    return this.allPosts().filter(post => post.tags.includes(tag));
  });

  groupedPostsByYear = computed(() => {
    if (this.filteredPosts().length === 0) {
      return {};
    }
    return this.filteredPosts().reduce((acc: YearlyPosts, post) => {
      const yearKey = post.publishDate.substring(0, 4);
      const monthKey = post.publishDate.substring(0, 7);
      
      if (!acc[yearKey]) {
        acc[yearKey] = {};
      }
      if (!acc[yearKey][monthKey]) {
        acc[yearKey][monthKey] = [];
      }

      acc[yearKey][monthKey].push(post);
      return acc;
    }, {});
  });

  sortedYears = computed(() => {
    return Object.keys(this.groupedPostsByYear()).sort().reverse();
  });

  sortedMonths = computed(() => {
    const grouped = this.groupedPostsByYear();
    return this.sortedYears().flatMap(year => 
      Object.keys(grouped[year]).sort().reverse()
    );
  });

  getSortedMonthsForYear(year: string): string[] {
    const yearlyPosts = this.groupedPostsByYear();
    if (!yearlyPosts[year]) {
      return [];
    }
    return Object.keys(yearlyPosts[year]).sort().reverse();
  }

  ngAfterViewInit(): void {
    this.setupIntersectionObserver();
    window.addEventListener('scroll', this.onWindowScroll);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    window.removeEventListener('scroll', this.onWindowScroll);
  }

  private onWindowScroll = (): void => {
    const yOffset = window.scrollY;
    const show = yOffset > 400; // Show button after scrolling down 400px
    if (show !== this.showScrollToTop()) {
        this.showScrollToTop.set(show);
    }
  }
  
  private setupIntersectionObserver(): void {
     const options = {
      rootMargin: '-120px 0px -60% 0px',
      threshold: 0,
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const monthId = entry.target.getAttribute('data-month-id');
          if (monthId) {
            this.activeMonth.set(monthId);
          }
        }
      });
    }, options);

    this.observeMonthSections();
  }
  
  private observeMonthSections(): void {
    const elements = this.elementRef.nativeElement.querySelectorAll('[data-month-id]');
    elements.forEach((el: Element) => this.observer?.observe(el));
  }

  selectTag(tag: string | null): void {
    this.selectedTag.set(tag);
    
    this.observer?.disconnect();
    setTimeout(() => this.observeMonthSections(), 0);
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  formatMonth(monthKey: string): string {
    return new Date(monthKey + '-02').toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
    });
  }

  formatMonthOnly(monthKey: string): string {
    return new Date(monthKey + '-02').toLocaleDateString('zh-CN', {
      month: 'long',
    });
  }
  
  formatDay(dateString: string): string {
    return new Date(dateString).getDate().toString();
  }

  scrollToMonth(event: MouseEvent, monthKey: string): void {
    event.preventDefault();
    const element = this.elementRef.nativeElement.querySelector(`section[id="${monthKey}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  
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