import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-not-found-redirect',
    template: `` // vuoto: redirige subito
})
export class NotFoundRedirectComponent {
    private router = inject(Router);
    private auth = inject(AuthService);

    async ngOnInit() {
        let user = this.auth.user();
        if (!user) {
            try {
                user = await firstValueFrom(this.auth.me());
            } catch { /* not logged in */ }
        }

        if (user) {
            this.router.navigate(['/dashboard'], { queryParams: { reason: 'page not found' } });
        } else {
            this.router.navigate([''], { queryParams: { reason: 'unauthorized' } });
        }
    }
}
