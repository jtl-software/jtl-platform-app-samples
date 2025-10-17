import { createLogoutResponse } from '@/server/auth';

/**
 * Logs out the user by clearing the authentication cookie
 */
export async function POST() {
  return createLogoutResponse();
}
