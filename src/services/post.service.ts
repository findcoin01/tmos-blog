import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Post } from '../models/post.model';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private dataService = inject(DataService);
  private http = inject(HttpClient);
  private _posts = signal<Post[]>([]);

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
  posts = computed(() => this._posts());
  
  getPostById(id: number): Post | undefined {
    return this._posts().find(p => p.id === id);
  }

  totalWordCount = computed(() => {
    // A simplified word count logic
    return this._posts().reduce((acc, post) => acc + post.content.split(/\s+/).length, 0);
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
      // FIX: Explicitly type the 'response' parameter to resolve the 'unknown' type error.
      // The compiler was failing to infer the type from the HttpClient.post generic.
      next: (response: { post: Post }) => {
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
      authorAvatarUrl: 'https://picsum.photos/seed/avatar1/40/40',
      publishDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      tags: ['新文章'],
      likes: 0,
      comments: 0,
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
