import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export type CommentVisibility = 'PUBLIC' | 'INTERNAL';

export interface CommentAuthor {
  userCode: string;
  name: string;
  role: string;
}

export interface Comment {
  id: string;
  content: string;
  visibility: CommentVisibility;
  createdAt: string;
  updatedAt: string;
  author: CommentAuthor;
}

export interface CreateCommentPayload {
  content: string;
  visibility?: CommentVisibility;
}

@Injectable({ providedIn: 'root' })
export class CommentService {
  private http = inject(HttpClient);

  getComments(ticketCode: string, page = 1, amount = 20) {
    return this.http.get<{ data: Comment[] }>(`/api/tickets/${ticketCode}/comments`, {
      params: { page, amount },
      withCredentials: true,
    });
  }

  addComment(ticketCode: string, payload: CreateCommentPayload) {
    return this.http.post<{ data: Comment }>(`/api/tickets/${ticketCode}/comments`, payload, {
      withCredentials: true,
    });
  }

  deleteComment(ticketCode: string, commentId: string) {
    return this.http.delete<void>(`/api/tickets/${ticketCode}/comments/${commentId}`, {
      withCredentials: true,
    });
  }
}
