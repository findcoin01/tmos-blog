import { Component, ChangeDetectionStrategy, input, output, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Post } from '../../models/post.model';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-post-card',
  templateUrl: './post-card.component.html',
  imports: [NgOptimizedImage, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostCardComponent {
  post = input.required<Post>();
  priority = input<boolean>(false);

  edit = output<Post>();
  deleteRequest = output<Post>();
  
  private adminService = inject(AdminService);
  isAdmin = this.adminService.isAdmin;

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

  onEdit(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    this.edit.emit(this.post());
  }

  onDelete(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    this.deleteRequest.emit(this.post());
  }
}