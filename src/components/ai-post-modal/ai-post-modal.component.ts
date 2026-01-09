import { Component, ChangeDetectionStrategy, input, output, signal, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Post } from '../../models/post.model';
import { GeminiService } from '../../services/gemini.service';

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
  
  private geminiService = inject(GeminiService);

  // Use a signal to hold the form data
  postData = signal<Partial<Post>>({});
  isNewPost = signal(true);
  
  // --- AI Generation State ---
  aiTopic = signal('');
  isGenerating = signal(false);
  geminiError = this.geminiService.error;


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
          published: false,
        });
        this.isNewPost.set(true);
      }
    });
  }

  // --- AI Methods ---
  onAiTopicChange(topic: string): void {
    this.aiTopic.set(topic);
  }

  async generateWithAi(): Promise<void> {
    const topic = this.aiTopic().trim();
    if (!topic || this.isGenerating()) return;

    this.isGenerating.set(true);
    const result = await this.geminiService.generateBlogPost(topic);
    if (result) {
      this.postData.update(p => ({
        ...p,
        title: result.title,
        summary: result.summary,
      }));
    }
    this.isGenerating.set(false);
  }

  // --- Form Field Methods ---
  onTitleChange(title: string): void {
    this.postData.update(p => ({ ...p, title }));
  }

  onSummaryChange(summary: string): void {
    this.postData.update(p => ({ ...p, summary }));
  }

  onContentChange(content: string): void {
    this.postData.update(p => ({ ...p, content }));
  }

  handleSave(isPublished: boolean): void {
    const currentData = this.postData();
    // Basic validation
    if (currentData.title?.trim() && currentData.summary?.trim()) {
       this.save.emit({ ...currentData, published: isPublished } as Post);
    }
  }

  handleClose(): void {
    this.close.emit();
  }
}