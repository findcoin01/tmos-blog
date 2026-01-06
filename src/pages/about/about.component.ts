import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-about',
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
      <div class="h-48 bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
        <img [ngSrc]="'https://picsum.photos/seed/avatar1/128/128'" alt="Author Avatar" width="128" height="128" priority class="w-32 h-32 rounded-full border-4 border-white dark:border-gray-300 shadow-xl">
      </div>
      <div class="p-8 text-center">
        <h2 class="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">关于 TMOS</h2>
        <p class="text-gray-500 dark:text-gray-400 mb-6">本站作者</p>
        
        <p class="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          你好呀！我是TMOS，一个热衷于探索技术与文化交汇点的博主。✨
          <br><br>
          创建这个小小的博客，是为了分享我对编程技术的思考、对动漫影视的感悟，以及记录生活中的奇思妙想。无论是代码中的一行巧思，新番里的一帧感动，还是日常里的点滴小确幸，都想在这里与你分享。
          <br><br>
          希望我的文字能给你带来一丝温暖和快乐！
        </p>

        <div class="mt-8 border-t dark:border-gray-700 pt-6">
          <p class="text-gray-500 dark:text-gray-400">找到我：</p>
          <div class="flex justify-center space-x-4 mt-2 text-pink-500 dark:text-pink-400">
            <a href="#" class="hover:text-pink-600 dark:hover:text-pink-300 transition-colors">Twitter</a>
            <a href="#" class="hover:text-pink-600 dark:hover:text-pink-300 transition-colors">GitHub</a>
            <a href="#" class="hover:text-pink-600 dark:hover:text-pink-300 transition-colors">Bilibili</a>
          </div>
        </div>
      </div>
    </div>
  `,
  imports: [NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {}