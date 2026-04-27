import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router } from "@angular/router";
import { AuthService } from "./services/auth.service";
import { firstValueFrom } from "rxjs";

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
    constructor(private auth: AuthService, private router: Router) { }

    async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
        let user = this.auth.user();

        // Al reload la pagina, il signal è null: ripristina stato da /me
        if (!user) {
            try {
                user = await firstValueFrom(this.auth.me());
            } catch {
                this.router.navigate([''], { queryParams: { reason: 'user not logged in' } });
                return false;
            }
        }

        if (user.status === 'PENDING_APPROVAL') return true;

        const expectedRoles = route.data['roles'] as string[];
        if (!expectedRoles?.includes(user.role)) {
            this.router.navigate(['']);
            return false;
        }

        return true;
    }
}
