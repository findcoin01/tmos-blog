

export interface Post {
  id: number;
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  author: string;
  authorAvatarUrl: string;
  publishDate: string;
  tags: string[];
  likes: number;
  comments: number;
  published: boolean;
}