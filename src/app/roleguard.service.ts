import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router } from "@angular/router";
import { UserService } from "./data/user.service";

@Injectable({
    providedIn: 'root'
})
export class RoleGuard implements CanActivate {
    constructor(private authService: UserService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot): boolean {
        const expectedRoles = route.data['roles'] as Array<string>;
        const userRole = this.authService.getUserRole();

        if (!this.authService.isLoggedIn()) {
            this.router.navigate([''], { queryParams: { reason: 'user not logged in' } })
            return false;
        }

        if (!userRole || !expectedRoles.includes(userRole)) {
            this.router.navigate(['/unauthorized'], { queryParams: { reason: 'user not authorized' } });
            return false;
        }

        return true;
    }
}