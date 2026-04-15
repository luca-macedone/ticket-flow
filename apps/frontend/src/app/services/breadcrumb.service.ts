import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  breadcrumbs: Array<{ label: string, url: string }> = []

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.breadcrumbs = this.buildBreadcrumbs(this.router.routerState.snapshot.root)
      })
  }

  private buildBreadcrumbs(
    route: ActivatedRouteSnapshot,
    url: string = "",
    breadcrumbs: any[] = []
  ): any[] {
    const label = route.data['breadcrumb'];
    const path = route.routeConfig?.path;

    if (label && path) {
      const nextUrl = `${url}/${path}`;
      breadcrumbs.push({ label: label, url: nextUrl });
      url = nextUrl;
    }

    if (route.firstChild) {
      return this.buildBreadcrumbs(route.firstChild, url, breadcrumbs)
    }

    return breadcrumbs
  }

  getBreadcrumbs() {
    return this.breadcrumbs
  }
}
