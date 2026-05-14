import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref, ActivatedRoute, RouterLinkActive } from "@angular/router";
import { Breadcrump } from "../../components/breadcrump/breadcrump";
import { AuthService } from '../../services/auth.service';
import { firstValueFrom } from 'rxjs';
import { NgIcon } from "@ng-icons/core";
import { TooltipBase } from "../../components/tooltip-base/tooltip-base";
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet, Breadcrump, RouterLinkWithHref, NgIcon, RouterLinkActive, TooltipBase],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  adminService = inject(AdminService);

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
