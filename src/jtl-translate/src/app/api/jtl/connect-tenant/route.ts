import { withAuthorization } from '@/server/auth';
import { getClient } from '@/server/jtl-cloud-client';
import { setTenantId } from '@/server/tenant';

/**
 * This endpoint is used during the setup phase in the JTL Hub to connect a JTL tenant
 * with the Translate plugin. See `jtl/setup/page.tsx` for details.
 */
export const POST = withAuthorization(async (req, user) => {
  try {
    // Parse the request body
    const body = (await req.json()) as { sessionToken?: string; email?: string } | undefined;

    // Validate that required fields exist
    if (!body?.sessionToken) {
      return Response.json(
        {
          error: 'ValidationError',
          error_description: 'Missing required fields: sessionToken is required',
        },
        { status: 400 },
      );
    }

    // Extract the Tenant ID from the session token
    const client = getClient();
    const { tenantId } = await client.getTenantInfo(body.sessionToken);

    // Store the relation between our own user (email) and the associated JTL Tenant ID
    await setTenantId(user.email, tenantId);

    // Reply with success
    return Response.json({ success: true });
  } catch (ex) {
    // Log the error and respond with 500
    console.error('Error processing request:', ex);
    return Response.json(
      {
        error: 'ServerError',
        error_description: 'Failed to process the request',
      },
      { status: 500 },
    );
  }
});
