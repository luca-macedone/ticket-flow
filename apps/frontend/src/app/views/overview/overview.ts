import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-overview',
  imports: [],
  templateUrl: './overview.html',
  styleUrl: './overview.css',
})
export class Overview {
  private auth = inject(AuthService);

  user = this.auth.user;
  isAdmin = computed(() => this.auth.user()?.role === 'admin');
  isPending = computed(() => this.auth.user()?.status === 'PENDING_APPROVAL');
}
