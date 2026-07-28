/**
 * frontend/src/core/config/api.ts
 * Enterprise API Configuration for decoupled Backend Communication.
 */
import { env } from '../../config/env';

export const API_CONFIG = {
  baseUrl: env.BACKEND_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};
