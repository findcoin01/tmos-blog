import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { DataService } from '../../services/data.service';
import { Friend } from '../../models/app-data.model';

@Component({
  selector: 'app-friends',
  template: `
    <div class="container mx-auto px-4 py-8">
      <h2 class="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-4">
        我的朋友们
      </h2>
      <p class="text-center text-gray-500 dark:text-gray-400 mb-12">欢迎访问他们的博客！</p>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        @for (friend of friends(); track friend.name) {
          <a [href]="friend.link" target="_blank" rel="noopener noreferrer" 
             class="group block bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center transform hover:-translate-y-2 transition-all duration-300 ease-in-out">
            <img [ngSrc]="friend.avatarUrl" [alt]="friend.name" width="80" height="80" class="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-transparent group-hover:border-pink-400 transition-colors duration-300" />
            <h3 class="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{{ friend.name }}</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ friend.description }}</p>
          </a>
        }
      </div>
    </div>
  `,
  imports: [NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FriendsComponent {
  private dataService = inject(DataService);
  friends = signal<Friend[]>([]);

  constructor() {
    this.dataService.getFriends().subscribe({
      next: (friends) => this.friends.set(friends),
      error: (err) => {
        console.error('Failed to load friends from db.json', err);
        this.friends.set([]); // Set to empty array on error
      },
    });
  }
}
