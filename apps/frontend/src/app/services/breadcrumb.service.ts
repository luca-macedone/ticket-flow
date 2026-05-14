import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  private router = inject(Router);

  breadcrumbs: { label: string; url: string }[] = [];

  constructor() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.breadcrumbs = this.buildBreadcrumbs(this.router.routerState.snapshot.root);
    });
  }

  private buildBreadcrumbs(
    route: ActivatedRouteSnapshot,
    url = '',
    breadcrumbs: { label: string; url: string }[] = [],
  ): { label: string; url: string }[] {
    const label = route.data['breadcrumb'];
    const pathSegments = route.url.map((s) => s.path).join('/');

    if (pathSegments) {
      url = `${url}/${pathSegments}`;
      if (label) {
        breadcrumbs.push({ label, url });
      }
    }

    if (route.firstChild) {
      return this.buildBreadcrumbs(route.firstChild, url, breadcrumbs);
    }

    return breadcrumbs;
  }

  getBreadcrumbs() {
    return this.breadcrumbs;
  }
}
