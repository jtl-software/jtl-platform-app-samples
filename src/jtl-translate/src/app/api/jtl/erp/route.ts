import { withAuthorization } from '@/server/auth';
import { FetchOptions, getClient } from '@/server/jtl-cloud-client';
import { getTenantId } from '@/server/tenant';

/**
 * Proxies access to the JTL Wawi API using our JTL cloud client.
 */
export const POST = withAuthorization(async (req, user) => {
  try {
    // Extract request options from the request body
    const opts = (await req.json()) as FetchOptions | undefined;

    // Make sure the options look somewhat valid
    if (!opts || !opts.path)
      return Response.json(
        {
          error: 'BadRequestError',
          error_description: 'Insufficient query parameters',
        },
        { status: 400 },
      );

    // Get the tenant ID
    const tenantId = await getTenantId(user.email);
    if (!tenantId)
      return Response.json(
        {
          error: 'NoTenantError',
          error_description: 'This user has no JTL Tenant associated. Make sure to activate the plugin in JTL Hub.',
        },
        { status: 400 },
      );

    // Fetch the API data
    const client = getClient();
    return client
      .fetch({ tenantId, ...opts })
      .then(data => Response.json(data))
      .catch(err => Response.json({ error: 'QueryError', error_description: err instanceof Error ? err.message : 'Unknown Error' }, { status: 400 }));
  } catch (err) {
    console.error('Error during JTL wawi fetch:', err);
    return Response.json(
      {
        error: 'ServerError',
        error_description: err instanceof Error ? err.message : 'Unknown Error',
      },
      { status: 500 },
    );
  }
});
