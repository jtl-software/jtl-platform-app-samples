/**
 * Creates a remote tunnel with ngrok to expose the dev server to the internet (if configured).
 * This function is executed when the next.js server starts:
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  // only enable the ngrok proxy in dev mode
  if (process.env.NODE_ENV !== 'development') return;

  // ngrok configuration, see .env file for more info
  const port = process.env.PORT;
  const domain = process.env.NGROK_DOMAIN;
  const authToken = process.env.NGROK_AUTH_TOKEN;

  // expose our app to the public internet
  if (port && domain && authToken) {
    try {
      const { forward } = await import('@ngrok/ngrok');
      const ngrok = await forward({
        addr: port,
        authtoken: authToken,
        domain: domain,
      });
      console.info(` ✓ Public URL (ngrok): ${ngrok.url()}`);
    } catch (ex) {
      console.info(` ✗ Public URL (ngrok): Failed to forward connection: ${ex}`);
    }
  } else {
    console.info(` ✗ Public URL (ngrok): Not configured. Check the ngrok section in the .env file to expose the dev server to the internet`);
  }
}
