// types/Comment.ts
export interface User {
    _id: string;
    username: string;
    photo: string;
  }
  
  export interface Comment {
    _id: string;
    content: string;
    user: User;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface CommentsResponse {
    product: {
      id: string;
      comments: Comment[];
      ratings: any[];
      userRating?: number; // optional if it might not be present
    };
    page: number;
    limit: number;
    totalComments: number;
  }
