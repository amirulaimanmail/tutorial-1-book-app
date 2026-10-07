import { authenticate, createSession } from "@/lib/auth";

export async function POST(request) {
  let credentials;
  try {
    credentials = await request.json();
  } catch {
    return Response.json(
      { error: "Enter your username and password." },
      { status: 400 },
    );
  }

  const username = authenticate(credentials?.username, credentials?.password);
  if (!username) {
    return Response.json(
      { error: "That username and password do not match." },
      { status: 401 },
    );
  }

  await createSession(username);
  return Response.json({ username });
}
