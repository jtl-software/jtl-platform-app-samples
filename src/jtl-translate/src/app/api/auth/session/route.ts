import { getAuthenticatedUser } from '@/server/auth';
import { getTenantId } from '@/server/tenant';

/**
 * Verifies if the user is authenticated by checking the JWT token cookie
 */
export async function POST() {
  const user = await getAuthenticatedUser();
  const tenantId = user ? await getTenantId(user.email) : undefined;
  return Response.json({
    authenticated: !!user,
    user,
    tenantId,
  });
}
