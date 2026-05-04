import { Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref, Router, ActivatedRoute, RouterLinkActive } from "@angular/router";
import { Breadcrump } from "../../components/breadcrump/breadcrump";
import { AuthService } from '../../services/auth.service';
import { firstValueFrom } from 'rxjs';
import { NgIcon } from "@ng-icons/core";
import { TooltipBase } from "../../components/tooltip-base/tooltip-base";

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet, Breadcrump, RouterLinkWithHref, NgIcon, RouterLinkActive, TooltipBase],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);

  user = this.auth.user;
  isAdmin = computed(() => this.auth.user()?.role === 'admin');
  isPending = computed(() => this.auth.user()?.status === 'PENDING_APPROVAL');
  isRejected = computed(() => this.auth.user()?.status === 'REJECTED');
  sidebarExpanded = signal(false);

  reason: string | null = null;

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.reason = params.get('reason');
    });
  }

  toggleSidebar() {
    this.sidebarExpanded.update(v => !v);
  }

  logout() {
    firstValueFrom(this.auth.logout());
  }
}
