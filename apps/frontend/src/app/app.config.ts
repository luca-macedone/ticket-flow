import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';
import { provideIcons } from '@ng-icons/core';
import { heroArrowRightEndOnRectangle, heroArrowRightOnRectangle, heroArrowTopRightOnSquare, heroBuildingOffice2, heroCheckCircle, heroChevronLeft, heroChevronRight, heroCube, heroHome, heroInformationCircle, heroRocketLaunch, heroTicket, heroUsers, heroWrenchScrewdriver, heroXCircle, heroXMark } from '@ng-icons/heroicons/outline';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideIcons({ heroXMark, heroRocketLaunch, heroUsers, heroArrowRightOnRectangle, heroArrowRightEndOnRectangle, heroBuildingOffice2, heroCube, heroHome, heroChevronLeft, heroChevronRight, heroTicket, heroArrowTopRightOnSquare, heroCheckCircle, heroXCircle, heroInformationCircle, heroWrenchScrewdriver })
  ]
};
