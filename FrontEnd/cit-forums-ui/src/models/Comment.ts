export interface Comment {
  id: number;
  content: string;
  authorId: number;
  authorName: string;
  threadId: number;
  createdAt: string;
  updatedAt?: string;
} 