
import { Component, ChangeDetectionStrategy, signal, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="py-8 text-center text-gray-400 text-sm">
      <div class="mb-6 border-t border-gray-200 dark:border-gray-700 w-1/4 mx-auto"></div>

      <!-- Runtime Section -->
      <div class="mb-6">
        <p class="tracking-wider text-gray-500 dark:text-gray-400">本站已悄悄运行</p>
        <div class="font-mono text-base text-gray-600 dark:text-gray-300 mt-2 space-x-2">
          <span>{{ runtimeDuration().days }}</span><span class="text-xs">天</span>
          <span>{{ runtimeDuration().hours.toString().padStart(2, '0') }}</span><span class="text-xs">时</span>
          <span>{{ runtimeDuration().minutes.toString().padStart(2, '0') }}</span><span class="text-xs">分</span>
          <span>{{ runtimeDuration().seconds.toString().padStart(2, '0') }}</span><span class="text-xs">秒</span>
        </div>
      </div>

      <p>&copy; {{ currentYear }} TMOS. 版权所有。</p>
      <p class="mt-1">在 Applet 环境中用 ✨ 精心制作</p>
    </footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent implements OnInit, OnDestroy {
  currentYear = new Date().getFullYear();
  runtimeDuration = signal({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  private timerId: any;
  private readonly launchDate = new Date('2025-09-01T00:00:00');

  ngOnInit(): void {
    this.updateRuntime(); // Initial call
    this.timerId = setInterval(() => {
      this.updateRuntime();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  private updateRuntime(): void {
    const now = new Date();
    let diff = now.getTime() - this.launchDate.getTime();

    if (diff < 0) {
      this.runtimeDuration.set({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);

    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);

    const minutes = Math.floor(diff / (1000 * 60));
    diff -= minutes * (1000 * 60);

    const seconds = Math.floor(diff / 1000);

    this.runtimeDuration.set({ days, hours, minutes, seconds });
  }
}
