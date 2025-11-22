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
      50: '{sky.50}',
      100: '{sky.100}',
      200: '{sky.200}',
      300: '{sky.300}',
      400: '{sky.400}',
      500: '{sky.500}',
      600: '{sky.600}',
      700: '{sky.700}',
      800: '{sky.800}',
      900: '{sky.900}',
      950: '{sky.950}',
    },
    colorScheme: {
      light: {
        primary: {
          color: '{sky.700}',
          contrastColor: '#ffffff',
          hoverColor: '{sky.800}',
          activeColor: '{sky.900}',
        },
      },
      dark: {
        primary: {
          color: '{sky.200}',
          contrastColor: '{sky.950}',
          hoverColor: '{sky.100}',
          activeColor: '{sky.300}',
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
