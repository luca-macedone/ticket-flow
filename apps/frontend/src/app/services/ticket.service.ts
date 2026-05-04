import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export type TicketStatus = 'ON_HOLD' | 'ON_APPROVAL' | 'ON_QUEUE' | 'FULFILLMENT' | 'APPROVED' | 'REJECTED' | 'DONE' | 'CANCELLED';
export type TicketCategory = 'GENERAL' | 'BUG' | 'FEATURE' | 'SUPPORT' | 'MAINTENANCE';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Ticket {
  id: string;
  ticketCode: string;
  ticketName: string;
  ticketDescription: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  startDate: string | null;
  endDate: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  projectId: string | null;
  assigneeId: string | null;
  reporterId: string | null;
  project?: { id: string; projectName: string };
  assignee?: { id: string; name: string };
  reporter?: { id: string; name: string };
}

export interface CreateTicketPayload {
  ticketCode: string;
  ticketName: string;
  ticketDescription?: string;
  startDate?: string;
  endDate?: string;
  status?: TicketStatus;
  category?: TicketCategory;
  priority?: TicketPriority;
  projectId?: string;
}

export type UpdateTicketPayload = Partial<CreateTicketPayload>;

export interface PaginatedTickets {
  data: Ticket[];
  total: number;
  page: number;
}

@Injectable({ providedIn: 'root' })
export class TicketService {
  private http = inject(HttpClient);

  getMyQueue(page = 1, amount = 20, sortBy?: string, sortDir?: string) {
    const params: any = { page, amount };
    if (sortBy) { params['sortBy'] = sortBy; params['sortDir'] = sortDir ?? 'asc'; }

    return this.http.get<PaginatedTickets>('/api/tickets/my-queue', {
      params,
      withCredentials: true,
    });
  }

  getMyTickets(page = 1, amount = 20, sortBy?: string, sortDir?: string) {
    const params: any = { page, amount };
    if (sortBy) { params['sortBy'] = sortBy; params['sortDir'] = sortDir ?? 'asc'; }

    return this.http.get<PaginatedTickets>('/api/tickets/my-tickets', {
      params,
      withCredentials: true,
    });
  }

  getAll(page = 1, amount = 20) {
    return this.http.get<PaginatedTickets>('/api/tickets', {
      params: { page, amount },
      withCredentials: true,
    });
  }

  getById(id: string) {
    return this.http.get<Ticket>(`/api/tickets/${id}`, {
      withCredentials: true,
    });
  }

  create(payload: CreateTicketPayload) {
    return this.http.post<Ticket>('/api/tickets', payload, {
      withCredentials: true,
    });
  }

  update(id: string, payload: UpdateTicketPayload) {
    return this.http.patch<Ticket>(`/api/tickets/${id}`, payload, {
      withCredentials: true,
    });
  }

  delete(id: string) {
    return this.http.delete<void>(`/api/tickets/${id}`, {
      withCredentials: true,
    });
  }
}
