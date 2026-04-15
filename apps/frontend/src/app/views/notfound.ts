import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-not-found-redirect',
    template: `` // vuoto: redirige subito
})
export class NotFoundRedirectComponent {

    constructor(private router: Router) {
        this.router.navigate([''], {
            queryParams: { reason: 'unathorized' }
        });
    }
}
