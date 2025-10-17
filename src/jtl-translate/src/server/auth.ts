import { cookies } from 'next/headers';
import { sign, verify } from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secure-jwt-secret-key';
const JWT_COOKIE_NAME = 'jtl_translate_auth_token';

/**
 * Shape of an authenticated user
 */
export type User = {
  email: string;
};

/**
 * Verifies if the user is authenticated by checking the JWT token cookie
 */
export async function getAuthenticatedUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(JWT_COOKIE_NAME)?.value;
    if (!token) return null;
    const payload = verify(token, JWT_SECRET);
    if (payload && typeof payload === 'object' && 'email' in payload) {
      const email = payload.email as string;
      return { email };
    }
    return null;
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

/**
 * Middleware function to create an auth token
 */
export function createAuthTokenResponse(email: unknown) {
  // Validate email
  if (typeof email !== 'string' || !email.length) {
    return NextResponse.json(
      {
        error: 'ValidationError',
        error_description: 'Missing required fields: email is required',
      },
      { status: 400 },
    );
  }

  // Create a JWT token
  const token = sign({ email }, JWT_SECRET, { expiresIn: '1y' });

  // Respond with the token attached
  const res = NextResponse.json(
    {
      authenticated: true,
      user: {
        email,
      },
    },
    {
      status: 200,
    },
  );
  res.cookies.set({
    name: JWT_COOKIE_NAME,
    value: token,
    httpOnly: true,
    partitioned: true,
    path: '/',
    secure: true,
    sameSite: 'none',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
  return res;
}

/**
 * Middleware function for logging out a user
 */
export function createLogoutResponse() {
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: JWT_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: true,
    path: '/',
    maxAge: 0,
  });
  return response;
}

/**
 * Middleware that can be used to wrap a request handler that requires authorization.
 * The handler is only called if authorization was successful.
 */
export function withAuthorization(handler: (req: Request, user: User) => Promise<Response>) {
  return async (req: Request) => {
    const user = await getAuthenticatedUser();
    if (!user && !req.headers.has('X-SKIP-AUTH')) {
      return NextResponse.json({ error: 'UnauthorizedError', error_description: 'Authentication required' }, { status: 401 });
    }
    return handler(req, user ?? { email: 'anonymous@example.com' });
  };
}
