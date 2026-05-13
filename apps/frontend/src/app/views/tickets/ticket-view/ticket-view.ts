import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Ticket, TicketService } from '../../../services/ticket.service';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { BaseCard } from "../../../components/overview-cards/base-card/base-card";
import { AuthService } from '../../../services/auth.service';
import { DatePipe } from '@angular/common';
import { NgIcon } from "@ng-icons/core";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SkeletonBlock } from "../../../components/skeleton/skeleton-block/skeleton-block";

@Component({
  selector: 'app-ticket-view',
  imports: [BaseCard, DatePipe, RouterLink, NgIcon, SkeletonBlock],
  templateUrl: './ticket-view.html',
  styleUrl: './ticket-view.css',
})
export class TicketView implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ticketService = inject(TicketService);
  private destroyRef = inject(DestroyRef);

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
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(async params => {
        const code = params.get('code');
        if (!code) return;
        try {
          this.loading.set(true);
          const data: Ticket = await firstValueFrom(this.ticketService.getByCode(code));
          this.ticket.set(data);
        } catch {
          this.error.set('Ticket not found.');
        } finally {
          this.loading.set(false);
        }
      });
  }

  editTicket() {
    const code = this.ticket()?.ticketCode;
    if (code) {
      this.router.navigate(['dashboard/tickets/', code, 'edit']);
    }
  }
}
