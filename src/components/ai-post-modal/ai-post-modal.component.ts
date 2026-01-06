import { Component, ChangeDetectionStrategy, input, output, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-edit-post-modal',
  templateUrl: './ai-post-modal.component.html',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditPostModalComponent {
  // Post can be null for a new post
  initialState = input<Post | null>(null);
  close = output<void>();
  save = output<Post>();

  // Use a signal to hold the form data
  postData = signal<Partial<Post>>({});

  isNewPost = signal(true);

  constructor() {
    effect(() => {
      const initial = this.initialState();
      if (initial) {
        // Editing an existing post
        this.postData.set({ ...initial });
        this.isNewPost.set(false);
      } else {
        // Creating a new post
        this.postData.set({
          title: '',
          summary: '',
          content: '',
        });
        this.isNewPost.set(true);
      }
    });
  }

  // Helper to update signal for ngModel changes
  onTitleChange(title: string): void {
    this.postData.update(p => ({ ...p, title }));
  }

  onSummaryChange(summary: string): void {
    this.postData.update(p => ({ ...p, summary }));
  }

  onContentChange(content: string): void {
    this.postData.update(p => ({ ...p, content }));
  }

  handleSave(): void {
    // Basic validation
    if (this.postData().title?.trim() && this.postData().summary?.trim()) {
      this.save.emit(this.postData() as Post);
    }
  }

  handleClose(): void {
    this.close.emit();
  }
}
