'use client';

import posthog from 'posthog-js';

export const posthogLogger = {
  info: (...args: Parameters<typeof posthog.logger.info>) => posthog.logger.info(...args),
};
