import { Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref, Router } from "@angular/router";
import { Breadcrump } from "../../components/breadcrump/breadcrump";
import { AuthService } from '../../services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet, Breadcrump, RouterLinkWithHref],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private auth = inject(AuthService);

  user = this.auth.user;
  isPending = computed(() => this.auth.user()?.status === 'PENDING_APPROVAL');

  logout() {
    firstValueFrom(this.auth.logout());
  }
}
