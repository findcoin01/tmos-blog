import { Component, ChangeDetectionStrategy, signal, computed, inject, effect } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { DataService } from '../../services/data.service';
import { GalleryImage } from '../../models/app-data.model';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  imports: [NgOptimizedImage, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown)': 'onKeyDown($event)',
  },
})
export class GalleryComponent {
  private adminService = inject(AdminService);
  private dataService = inject(DataService);
  isAdmin = this.adminService.isAdmin;

  images = signal<GalleryImage[]>([]);

  // --- Lightbox State ---
  selectedImage = signal<GalleryImage | null>(null);
  selectedIndex = computed(() => {
    const selected = this.selectedImage();
    if (!selected) return -1;
    return this.images().findIndex(img => img.id === selected.id);
  });

  // --- Edit/Create Modal State ---
  isModalOpen = signal(false);
  imageToEdit = signal<Partial<GalleryImage> | null>(null);
  isNewImage = computed(() => !this.imageToEdit()?.id);

  constructor() {
    this.dataService.getGalleryImages().subscribe({
      next: (images) => this.images.set(images),
      error: (err) => {
        console.error('Failed to load gallery images from db.json', err);
        this.images.set([]); // Set to empty array on error
      },
    });

    effect(() => {
      // Pre-fill form when an image is selected for editing
      const image = this.imageToEdit();
      if (image) {
        this.isModalOpen.set(true);
      }
    });
  }
  
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      if (this.isModalOpen()) {
        this.closeModal();
      } else if (this.selectedImage()) {
        this.closeLightbox();
      }
    }
  }

  // --- Lightbox Methods ---
  openLightbox(image: GalleryImage): void {
    this.selectedImage.set(image);
  }

  closeLightbox(): void {
    this.selectedImage.set(null);
  }

  nextImage(event: MouseEvent): void {
    event.stopPropagation(); // Prevent backdrop click
    const currentIndex = this.selectedIndex();
    if (currentIndex > -1) {
      const nextIndex = (currentIndex + 1) % this.images().length;
      this.selectedImage.set(this.images()[nextIndex]);
    }
  }

  prevImage(event: MouseEvent): void {
    event.stopPropagation(); // Prevent backdrop click
    const currentIndex = this.selectedIndex();
    if (currentIndex > -1) {
      const prevIndex = (currentIndex - 1 + this.images().length) % this.images().length;
      this.selectedImage.set(this.images()[prevIndex]);
    }
  }

  // --- CRUD Methods ---
  openModal(image: GalleryImage | null, event?: MouseEvent): void {
    event?.stopPropagation();
    event?.preventDefault();
    if (image) {
      this.imageToEdit.set({ ...image }); // Edit existing
    } else {
      this.imageToEdit.set({ title: '', description: '' }); // Create new
    }
  }

  closeModal(): void {
    this.imageToEdit.set(null);
    this.isModalOpen.set(false);
  }

  handleSave(): void {
    const imageData = this.imageToEdit();
    if (!imageData || !imageData.title) return;

    if (this.isNewImage()) {
      // Create new image
      const maxId = Math.max(...this.images().map(i => i.id), 0);
      const newId = maxId + 1;
      const newImage: GalleryImage = {
        id: newId,
        thumbSrc: `https://picsum.photos/seed/gallery${newId}/400/400`,
        fullSrc: `https://picsum.photos/seed/gallery${newId}/1200/800`,
        title: imageData.title,
        description: imageData.description || '',
      };
      this.images.update(imgs => [newImage, ...imgs]);
    } else {
      // Update existing image
      this.images.update(imgs =>
        imgs.map(img => (img.id === imageData.id ? { ...img, ...imageData } : img))
      );
    }
    this.closeModal();
  }

  handleDelete(imageToDelete: GalleryImage, event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    if (confirm(`您确定要删除图片 “${imageToDelete.title}” 吗？`)) {
      this.images.update(imgs => imgs.filter(img => img.id !== imageToDelete.id));
    }
  }
  
  onTitleChange(title: string): void {
    this.imageToEdit.update(p => p ? { ...p, title } : { title });
  }

  onDescriptionChange(description: string): void {
    this.imageToEdit.update(p => p ? { ...p, description } : { description });
  }
}