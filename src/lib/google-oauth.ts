
/**
 * Helper for Google OAuth2 (popup & PKCE/implicit demo flow)
 * WARNING: This is for DEMO USE ONLY! DO NOT USE IN PROD.
 */

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

// We store in localStorage for demo
const CREDS_KEY = "google_oauth_creds";
const TOKEN_KEY = "google_oauth_token";

/**
 * Store user client credentials in localStorage
 */
export function storeGoogleCreds(input: {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string;
}) {
  localStorage.setItem(CREDS_KEY, JSON.stringify(input));
}

export function getStoredGoogleCreds():
  | { clientId: string; clientSecret: string; redirectUri: string; scopes: string }
  | null {
  try {
    const val = localStorage.getItem(CREDS_KEY);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

/** Store token info */
function saveToken(token: any) {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(token));
}
/** Get token info */
export function getGoogleToken(): any | null {
  try {
    const val = localStorage.getItem(TOKEN_KEY);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

export function disconnectGoogle() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(CREDS_KEY);
}

export function getGoogleStatus(): "not_connected" | "connected" {
  if (getStoredGoogleCreds() && getGoogleToken()) return "connected";
  return "not_connected";
}

/**
 * Open Google's OAuth2 popup and request an auth code
 * For demo: user copies and pastes back the ?code param, which we then exchange for tokens
 */
export async function googleAuthorizeWithPopup({
  clientId,
  redirectUri,
  scopes,
}: {
  clientId: string;
  redirectUri: string;
  scopes: string;
}) {
  // Step 1: Open Google Auth window
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
  });
  const fullUrl = `${GOOGLE_AUTH_URL}?${params.toString()}`;
  // Open popup, direct user to paste result code param back

  // Support both popup and normal window in strict environments
  window.open(fullUrl, "_blank", "noopener,width=500,height=700");

  // Prompt user to enter the code parameter after login (quick and dirty demo way)
  const code = await new Promise<string>((resolve, reject) => {
    setTimeout(() => {
      const userInput = prompt("After authorizing, copy the code in the URL (e.g., ?code=XXXX...). Paste it here:");
      if (!userInput) reject(new Error("No code provided"));
      else resolve(userInput.trim());
    }, 1000);
  });

  // Step 2: Exchange code for tokens
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: getStoredGoogleCreds()?.clientSecret || "",
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }).toString(),
  });

  if (!response.ok) {
    throw new Error(`Error exchanging code: ${response.statusText}`);
  }
  const token = await response.json();
  saveToken(token);
  return token;
}

/**
 * Get the valid access token, refreshing if needed.
 */
export async function getValidAccessToken(): Promise<string> {
  let token = getGoogleToken();
  if (!token) throw new Error("No OAuth2 token");
  // Check expiry
  const expTs = token.created_at
    ? token.created_at + token.expires_in * 1000
    : Date.now() + token.expires_in * 1000;
  if (expTs <= Date.now()) {
    // Need to refresh
    const creds = getStoredGoogleCreds();
    const resp = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        refresh_token: token.refresh_token,
        client_id: creds?.clientId || "",
        client_secret: creds?.clientSecret || "",
        grant_type: "refresh_token",
      }),
    });
    if (!resp.ok) throw new Error("Failed to refresh access token");
    const newToken = await resp.json();
    newToken.created_at = Date.now();
    saveToken(newToken);
    token = newToken;
  }
  return token.access_token;
}

