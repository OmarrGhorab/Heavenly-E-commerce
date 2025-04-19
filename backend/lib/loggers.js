import * as Sentry from '@sentry/node';

// Initialize Sentry if DSN exists
export const initSentry = () => {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      integrations: [
        Sentry.httpIntegration({ tracing: true }),
        Sentry.expressIntegration(),
      ],
      tracesSampleRate: 1.0,
    });
  }
};

// Error handling utility
export const captureError = (error) => {
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error);
  }
  console.error(error);
};