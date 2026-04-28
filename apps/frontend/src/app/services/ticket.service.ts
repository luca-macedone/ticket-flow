import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export interface Ticket {
  id: string,
  ticketCode: string,
  ticketName: string,
  status: string,
  priority: string,
  category: string,
  createdAt: string,
  project?: { id: string, projectName: string },
  assignee?: { id: string, name: string },
  reporter?: { id: string, name: string }
}

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private http = inject(HttpClient);

  getMyQueue(page: number = 1, amount: number = 20) {
    return this.http.get<{ data: Ticket[], total: number, page: number }>('/api/tickets/my-queue', {
      params: { page, amount },
      withCredentials: true,
    });
  }
  getMyTickets(page: number = 1, amount: number = 20) {
    return this.http.get<{ data: Ticket[], total: number, page: number }>('/api/tickets/my-tickets', {
      params: { page, amount },
      withCredentials: true,
    });
  }
}
