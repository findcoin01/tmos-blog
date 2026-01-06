import { Post } from './post.model';

export interface GalleryImage {
  id: number;
  thumbSrc: string;
  fullSrc: string;
  title: string;
  description: string;
}

export interface Friend {
  name: string;
  avatarUrl: string;
  description: string;
  link: string;
}

export interface AppData {
  posts: Post[];
  gallery: GalleryImage[];
  friends: Friend[];
}
