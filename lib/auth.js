import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";

const SESSION_COOKIE = "reading_list_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

const ACCOUNTS = new Map([["test", "123"]]);

function getSessionSecret() {
  const secret = process.env.AUTH_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SESSION_SECRET must contain at least 32 characters.");
  }

  return secret;
}

function sign(payload) {
  return createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("base64url");
}

function createToken(username) {
  const payload = Buffer.from(
    JSON.stringify({
      username,
      expiresAt: Date.now() + SESSION_DURATION_SECONDS * 1000,
    }),
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

function readToken(token) {
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return null;

  const expectedSignature = Buffer.from(sign(payload));
  const actualSignature = Buffer.from(signature);
  if (
    expectedSignature.length !== actualSignature.length ||
    !timingSafeEqual(expectedSignature, actualSignature)
  ) {
    return null;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (
      typeof session.username !== "string" ||
      !ACCOUNTS.has(session.username) ||
      typeof session.expiresAt !== "number" ||
      session.expiresAt <= Date.now()
    ) {
      return null;
    }

    return session.username;
  } catch {
    return null;
  }
}

export function authenticate(username, password) {
  if (typeof username !== "string" || typeof password !== "string") {
    return null;
  }

  const expectedPassword = ACCOUNTS.get(username);
  if (!expectedPassword) return null;

  const provided = Buffer.from(password);
  const expected = Buffer.from(expectedPassword);
  if (
    provided.length !== expected.length ||
    !timingSafeEqual(provided, expected)
  ) {
    return null;
  }

  return username;
}

export async function createSession(username) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, createToken(username), {
    httpOnly: true,
    maxAge: SESSION_DURATION_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionUser() {
  await connection();
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return token ? readToken(token) : null;
}

export function unauthorizedResponse() {
  return Response.json({ error: "Please log in to continue." }, { status: 401 });
}

export function safeRedirectPath(value) {
  if (
    typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\")
  ) {
    return value;
  }

  return "/";
}
