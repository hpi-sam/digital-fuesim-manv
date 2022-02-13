import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
    enableProdMode();
    // WORKAROUND for immer.js esm (see https://github.com/immerjs/immer/issues/557)
    window.process = {
        ...window.process,
        env: {
            ...window.process.env,
            NODE_ENV: 'production',
        },
    };
}

platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch((err) => console.error(err));
