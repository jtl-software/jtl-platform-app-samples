import { getDatabase } from './db';

// Get access to the tenant database
const db = getDatabase('jtl-tenants');

/**
 * Gets the JTL Tenant ID for our App user.
 */
export async function getTenantId(email: string): Promise<string | undefined> {
  const tenantId = await db.getKey<string>(email);
  return tenantId;
}

/**
 * Associates the email address of our App user with the JTL Tenant ID
 */
export async function setTenantId(email: string, tenantId: string): Promise<void> {
  await db.setKey(email, tenantId);
}
