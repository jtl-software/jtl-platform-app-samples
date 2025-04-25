import { createAuthTokenResponse } from "@/server/auth";

/**
 * This endpoint is used to login a user. To keep things simple, any email
 * is automatically logged in without requiring a password or registration first.
 */
export async function POST(req: Request) {
  const body = await req.json() as { email?: string } | undefined;
  return createAuthTokenResponse(body?.email);
}
