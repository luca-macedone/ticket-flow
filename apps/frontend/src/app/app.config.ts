import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';
import { provideIcons } from '@ng-icons/core';
import { heroArrowRightEndOnRectangle, heroArrowRightOnRectangle, heroBuildingOffice2, heroChevronLeft, heroChevronRight, heroCube, heroHome, heroRocketLaunch, heroUsers, heroXMark } from '@ng-icons/heroicons/outline';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideIcons({ heroXMark, heroRocketLaunch, heroUsers, heroArrowRightOnRectangle, heroArrowRightEndOnRectangle, heroBuildingOffice2, heroCube, heroHome, heroChevronLeft, heroChevronRight })
  ]
};
