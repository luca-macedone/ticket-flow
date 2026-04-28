import { inject, Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router } from "@angular/router";
import { AuthService } from "./services/auth.service";
import { firstValueFrom } from "rxjs";

export const roleGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    let user = auth.user();

    if (!user) {
        try {
            user = await firstValueFrom(auth.me());
            if (!user) throw new Error("empty response");
        } catch {
            return router.createUrlTree([''], { queryParams: { reason: "user not logged in" } });
        }
    }

    if (user.status !== 'APPROVED') return router.createUrlTree(['']);

    const expectedRoles = route.data['roles'] as string[];
    if (!expectedRoles?.includes(user.role)) {
        return router.createUrlTree(['']);
    }

    return true;
}

