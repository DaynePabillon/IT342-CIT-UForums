export interface Thread {
  id: number;
  title: string;
  content: string;
  forumId: number;
  commentCount: number;
  createdBy: {
    id: number;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  isLocked: boolean;
  isPinned: boolean;
} 