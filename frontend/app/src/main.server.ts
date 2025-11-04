import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';
import { appConfig } from './app/app.config';

// The SSR renderer calls the default export and may provide a platform/context object.
// When a server platform context is present, use the server config; otherwise fall back to
// the regular client app config so tools that call this function without a server context
// (like the route extractor) don't fail with NG0401.
export default function bootstrap(context?: { platformRef?: any }) {
  const cfg = context ? config : appConfig;
  return bootstrapApplication(AppComponent, cfg, context as any);
}
