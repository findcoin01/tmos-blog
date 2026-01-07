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

export interface SocialLink {
  name: string;
  url: string;
}

export interface AboutInfo {
  avatarUrl: string;
  name: string;
  title: string;
  bio: string;
  socialLinks: SocialLink[];
}

export interface AppData {
  posts: Post[];
  gallery: GalleryImage[];
  friends: Friend[];
  about: AboutInfo;
}