import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Ticket, TicketService } from '../../../services/ticket.service';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { BaseCard } from "../../../components/overview-cards/base-card/base-card";
import { AuthService } from '../../../services/auth.service';
import { DatePipe } from '@angular/common';
import { NgIcon } from "@ng-icons/core";

@Component({
  selector: 'app-ticket-view',
  imports: [BaseCard, DatePipe, RouterLink, NgIcon],
  templateUrl: './ticket-view.html',
  styleUrl: './ticket-view.css',
})
export class TicketView implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ticketService = inject(TicketService);

  ticket = signal<Ticket | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  private auth = inject(AuthService);
  isAdmin = computed(() => this.auth.user()?.role === 'admin');
  isAgent = computed(() => this.auth.user()?.role === 'agent');
  isOwnTicket = computed(() => {
    const email = this.auth.user()?.email;
    const reporterEmail = this.ticket()?.reporter?.email;
    return !!email && !!reporterEmail && email === reporterEmail;
  });


  async ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      const id = params.get('id');
      if (!id) return;
      try {
        this.loading.set(true);
        const data: Ticket = await firstValueFrom(this.ticketService.getById(id));
        this.ticket.set(data);
      } catch {
        this.error.set('Ticket not found.');
      } finally {
        this.loading.set(false);
      }
    });
  }

  editTicket() {
    const id = this.ticket()?.id;
    if (id) {
      this.router.navigate(['dashboard/tickets/', id, 'edit']);
    }
  }
}
