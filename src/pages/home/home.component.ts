import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-home',
  template: `
    <div>
      <!-- Famous Quote Section with Background Image -->
      <div class="relative rounded-2xl shadow-lg overflow-hidden mb-10 h-80 text-white flex flex-col justify-center items-center text-center p-8 bg-cover bg-center"
           style="background-image: url('https://picsum.photos/seed/sea-blossom/1200/400');">
        
        <!-- Overlay for readability -->
        <div class="absolute inset-0 bg-black/50"></div>
      
        <div class="relative z-10">
          <p class="text-3xl md:text-4xl font-serif italic leading-relaxed">
            “面朝大海，春暖花开。”
          </p>
          <p class="mt-6 text-lg text-white/80 tracking-wider">
            — 海子
          </p>
        </div>
      </div>
      
      <!-- Site Stats Section -->
      <div class="mt-10 w-full max-w-2xl mx-auto">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
          <!-- Total Word Count -->
          <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl text-center shadow-lg">
            <p class="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">全站字数</p>
            <div class="flex items-center justify-center text-gray-800 dark:text-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span class="text-3xl md:text-4xl font-bold">{{ totalWordCount() | number }}</span>
            </div>
          </div>
      
          <!-- Total Visits -->
          <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl text-center shadow-lg">
            <p class="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">本站访问</p>
             <div class="flex items-center justify-center text-gray-800 dark:text-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
               <span class="text-3xl md:text-4xl font-bold">{{ totalVisits() | number }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private postService = inject(PostService);

  totalWordCount = this.postService.totalWordCount;
  totalVisits = this.postService.totalVisits;
}