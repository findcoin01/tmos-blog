import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { marked } from 'marked';
import { Post } from '../models/post.model';
import { DataService } from './data.service';
import { AdminService } from './admin.service';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  // FIX: Explicitly type injected services to prevent 'unknown' type errors.
  private dataService: DataService = inject(DataService);
  private http: HttpClient = inject(HttpClient);
  private adminService: AdminService = inject(AdminService);
  private _posts = signal<Post[]>([]);

  private isAdmin = this.adminService.isAdmin;
  totalVisits = signal(0);

  constructor() {
    this.dataService.getPosts().subscribe({
      next: (posts) => this._posts.set(posts),
      error: (err) => {
        console.error('Failed to load posts from db.json', err);
        this._posts.set([]); // Set to empty array on error to prevent downstream issues
      },
    });

    this.dataService.getSiteStats().subscribe({
      next: (stats) => this.totalVisits.set(stats.totalVisits),
      error: (err) => {
        console.error('Failed to load site stats from db.json', err);
        this.totalVisits.set(0);
      },
    });
  }

  // --- Read Operations ---
  posts = computed(() => {
    const allPosts = this._posts();
    if (this.isAdmin()) {
      return allPosts; // Admins see all posts
    }
    return allPosts.filter(p => p.published); // Others see only published posts
  });
  
  getPostById(id: number): Post | undefined {
    // Admins can see any post, others can only see published ones by ID.
    const post = this._posts().find(p => p.id === id);
    if (!post) return undefined;
    return this.isAdmin() || post.published ? post : undefined;
  }

  totalWordCount = computed(() => {
    // Word count should only reflect publicly visible posts unless admin.
    const countablePosts = this.posts();
    return countablePosts.reduce((acc, post) => {
      if (!post.content) {
        return acc;
      }
      
      // 1. Convert markdown to HTML to easily strip markdown syntax.
      const html = marked.parse(post.content) as string;

      // 2. Strip all HTML tags to get plain text.
      const plainText = html.replace(/<[^>]*>/g, '');

      // 3. Match CJK characters individually and English/numeric words as a whole.
      const words = plainText.match(/[\u4e00-\u9fa5]|[a-zA-Z0-9]+/g);
      
      return acc + (words ? words.length : 0);
    }, 0);
  });
  
  // --- Write Operations ---

  likePost(postId: number): void {
    // Optimistically update the local state for immediate UI feedback
    this._posts.update(posts =>
      posts.map(p =>
        p.id === postId ? { ...p, likes: p.likes + 1 } : p
      )
    );

    // Send the request to the backend.
    this.http.post<{ post: Post }>(`/blog/like/${postId}`, {}).subscribe({
      // FIX: Rely on type inference for the response, which is now correctly typed.
      next: (response) => {
        console.log(`Like request for post ${postId} was successful.`);
        // Sync with server state to prevent desync issues.
        this._posts.update(posts =>
          posts.map(p => (p.id === response.post.id ? response.post : p))
        );
      },
      error: (err) => {
        console.error(`Failed to like post ${postId}. Reverting changes.`, err);
        // If the API call fails, revert the optimistic update.
        this._posts.update(posts =>
          posts.map(p =>
            p.id === postId ? { ...p, likes: p.likes - 1 } : p
          )
        );
      }
    });
  }

  addPost(postData: Partial<Post>): void {
    const posts = this._posts();
    const maxId = posts.reduce((max, p) => p.id > max ? p.id : max, 0);
    const newPost: Post = {
      id: maxId + 1,
      title: postData.title || '无标题文章',
      summary: postData.summary || '',
      content: postData.content || '',
      imageUrl: `https://picsum.photos/seed/newpost${maxId + 1}/600/400`,
      author: 'TMOS',
      // FIX: Corrected URL typo.
      authorAvatarUrl: 'https://picsum.photos/seed/avatar1/40/40',
      publishDate: new Date().toISOString(), // YYYY-MM-DDTHH:mm:ss.sssZ
      tags: ['新文章'],
      likes: 0,
      comments: 0,
      published: postData.published || false,
    };
    this._posts.set([newPost, ...posts]);
  }

  updatePost(updatedPost: Post): void {
    this._posts.update(posts => 
      posts.map(p => p.id === updatedPost.id ? { ...p, ...updatedPost } : p)
    );
  }

  deletePost(postId: number): void {
    this._posts.update(posts => posts.filter(p => p.id !== postId));
  }
}