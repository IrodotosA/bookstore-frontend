import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { authInterceptor } from './core/auth-interceptor';

import { routes } from './app.routes';

// import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { definePreset } from '@primeng/themes';
import Lara from '@primeuix/themes/lara';

const LaraSky = definePreset(Lara, {
  semantic: {
    primary: {
      50:  '#f8f3ee',
      100: '#efe4d7',
      200: '#e3ceba',
      300: '#d2b291',
      400: '#c08f5a',
      500: '#a9743f',
      600: '#8a5c32',
      700: '#6e4728',
      800: '#53361f',
      900: '#3b2717',
      950: '#25180e',
    },
    colorScheme: {
      light: {
        primary: {
          color: '#6e4728',        // main brown
          contrastColor: '#ffffff',
          hoverColor: '#53361f',   // darker brown
          activeColor: '#3b2717',
        },
      },
      dark: {
        primary: {
          color: '#e3ceba',
          contrastColor: '#25180e',
          hoverColor: '#d2b291',
          activeColor: '#c08f5a',
        },
      },
    },
  },
});


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    provideRouter(routes),
    // provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: LaraSky,
        options: {
          darkModeSelector: 'none',  // ⬅ disables system dark mode completely
          cssLayer: false,
        }
      }
    })
  ]
};
