const encoder = new TextEncoder();

function getSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set");
  }

  return encoder.encode(process.env.JWT_SECRET);
}

function base64UrlEncode(input: string | Uint8Array) {
  const bytes = typeof input === "string" ? encoder.encode(input) : input;
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4 || 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function decodeJson<T>(segment: string): T {
  const bytes = base64UrlDecode(segment);
  const text = new TextDecoder().decode(bytes);
  return JSON.parse(text) as T;
}

async function importSigningKey() {
  return crypto.subtle.importKey(
    "raw",
    getSecret(),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function parseExpiresIn(expiresIn: string): number {
  const value = expiresIn.trim();
  const match = value.match(/^(\d+)(ms|s|m|h|d)$/i);
  if (!match) {
    throw new Error(`Unsupported JWT expiry format: ${expiresIn}`);
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();

  switch (unit) {
    case "ms":
      return amount;
    case "s":
      return amount * 1000;
    case "m":
      return amount * 60 * 1000;
    case "h":
      return amount * 60 * 60 * 1000;
    case "d":
      return amount * 24 * 60 * 60 * 1000;
    default:
      throw new Error(`Unsupported JWT expiry unit: ${unit}`);
  }
}

async function signHmacSha256(value: string) {
  const key = await importSigningKey();
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return base64UrlEncode(new Uint8Array(signature));
}

export interface JWTPayload {
  sub: string;
  email: string;
  role: "USER" | "SUPPLIER" | "ADMIN";
  name: string;
  iat?: number;
  exp?: number;
}

export async function signToken(
  payload: Omit<JWTPayload, "iat" | "exp">,
  expiresIn = "7d",
): Promise<string> {
  const nowMs = Date.now();
  const iat = nowMs / 1000;
  const exp = iat + parseExpiresIn(expiresIn) / 1000;

  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64UrlEncode(JSON.stringify({ ...payload, iat, exp }));
  const unsigned = `${header}.${body}`;
  const signature = await signHmacSha256(unsigned);

  return `${unsigned}.${signature}`;
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const [header, body, signature] = token.split(".");
    if (!header || !body || !signature) return null;

    const parsedHeader = decodeJson<{ alg?: string; typ?: string }>(header);
    if (parsedHeader.alg !== "HS256" || parsedHeader.typ !== "JWT") return null;

    const key = await importSigningKey();
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlDecode(signature),
      encoder.encode(`${header}.${body}`),
    );

    if (!valid) return null;

    const payload = decodeJson<JWTPayload>(body);
    if (typeof payload.exp === "number" && Date.now() / 1000 >= payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
