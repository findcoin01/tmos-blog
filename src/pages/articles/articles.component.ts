import { Component, ChangeDetectionStrategy, signal, computed, inject, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import { PostService } from '../../services/post.service';
import { AdminService } from '../../services/admin.service';
import { PostCardComponent } from '../../components/post-card/post-card.component';
import { Post } from '../../models/post.model';
import { EditPostModalComponent } from '../../components/ai-post-modal/ai-post-modal.component';

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  imports: [PostCardComponent, EditPostModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticlesComponent {
  // FIX: Explicitly type injected services to resolve 'unknown' type errors.
  private postService: PostService = inject(PostService);
  private adminService: AdminService = inject(AdminService);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);
  private readonly POSTS_PER_PAGE = 9;

  allPosts = this.postService.posts;
  isAdmin = this.adminService.isAdmin;
  currentPage = signal(1);

  // --- Search ---
  searchQuery = toSignal(
    this.route.queryParamMap.pipe(map(params => params.get('q') ?? ''))
  );

  filteredPosts = computed<Post[]>(() => {
    // FIX: Safely handle the search query which can be undefined initially.
    const rawQuery = this.searchQuery();
    // FIX: Add type guard for rawQuery, as it can be of type 'unknown' which does not have a 'toLowerCase' method.
    if (typeof rawQuery !== 'string' || !rawQuery) {
      return this.allPosts();
    }
    const query = rawQuery.toLowerCase().trim();
    return this.allPosts().filter(post => 
      post.title.toLowerCase().includes(query) ||
      post.summary.toLowerCase().includes(query)
    );
  });

  // --- Pagination ---
  totalPages = computed(() =>
    Math.ceil(this.filteredPosts().length / this.POSTS_PER_PAGE)
  );

  paginatedPosts = computed(() => {
    const page = this.currentPage();
    const perPage = this.POSTS_PER_PAGE;
    const posts = this.filteredPosts();
    
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    
    return posts.slice(startIndex, endIndex);
  });

  // --- Modal State and CRUD ---
  isModalOpen = signal(false);
  postToEdit = signal<Post | null>(null);

  constructor() {
    effect(() => {
      // When the search query changes, reset to the first page.
      this.searchQuery();
      this.currentPage.set(1);
    }, { allowSignalWrites: true });
  }

  // --- Event Handlers ---

  openEditModal(post: Post | null): void {
    this.postToEdit.set(post);
    this.isModalOpen.set(true);
  }

  handleDelete(post: Post): void {
    if (confirm(`您确定要删除文章 “${post.title}” 吗？`)) {
      this.postService.deletePost(post.id);
    }
  }

  handleSave(post: Post): void {
    if (post.id) {
      // Existing post
      this.postService.updatePost(post);
    } else {
      // New post
      this.postService.addPost(post);
    }
    this.isModalOpen.set(false);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  prevPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  clearSearch(): void {
    this.router.navigate(['/articles']);
  }
}
