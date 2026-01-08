export interface Comment {
  id: number;
  postId: number;
  author: string;
  authorAvatarUrl: string;
  date: string; // ISO format string
  content: string;
}
