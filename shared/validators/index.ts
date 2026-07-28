/**
 * shared/validators/index.ts
 */

import { EMAIL_REGEX } from '../schemas';

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}
