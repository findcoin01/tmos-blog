import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { DataService } from '../../services/data.service';
import { AboutInfo } from '../../models/app-data.model';

@Component({
  selector: 'app-about',
  template: `
    @if (aboutInfo(); as info) {
      <div class="space-y-12">
        <!-- Main Bio Card -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div class="h-48 bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
            @if(isLocalUrl(info.avatarUrl)) {
              <img [src]="info.avatarUrl" [alt]="info.name + ' Avatar'" width="128" height="128" class="w-32 h-32 rounded-full border-4 border-white dark:border-gray-300 shadow-xl">
            } @else {
              <img [ngSrc]="info.avatarUrl" [alt]="info.name + ' Avatar'" width="128" height="128" priority class="w-32 h-32 rounded-full border-4 border-white dark:border-gray-300 shadow-xl">
            }
          </div>
          <div class="p-8 text-center">
            <h2 class="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">关于 {{ info.name }}</h2>
            <p class="text-gray-500 dark:text-gray-400 mb-6">{{ info.title }}</p>
            
            <p class="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed" style="white-space: pre-line;">{{ info.bio }}</p>

            <div class="mt-8 border-t dark:border-gray-700 pt-6">
              <p class="text-gray-500 dark:text-gray-400">找到我：</p>
              <div class="flex justify-center space-x-6 mt-4">
                @for (link of info.socialLinks; track link.name) {
                  <a [href]="link.url" target="_blank" rel="noopener noreferrer" [attr.aria-label]="'Visit my ' + link.name" class="text-gray-500 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400 transition-colors">
                    <span class="text-sm">{{ link.name }}</span>
                  </a>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    } @else {
      <div class="text-center p-8">
          <p class="text-gray-500 dark:text-gray-400">正在加载信息...</p>
      </div>
    }
  `,
  imports: [NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {
  private dataService = inject(DataService);
  aboutInfo = signal<AboutInfo | null>(null);

  constructor() {
    this.dataService.getAboutInfo().subscribe({
      next: (info) => this.aboutInfo.set(info),
      error: (err) => {
        console.error('Failed to load about info from db.json', err);
      },
    });
  }
  
  isLocalUrl(url: string): boolean {
    return !url.startsWith('http');
  }
}