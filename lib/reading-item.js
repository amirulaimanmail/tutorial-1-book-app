export class RequestError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function readReadingItem(request) {
  let data;
  try {
    data = await request.json();
  } catch {
    throw new RequestError("Send the reading item as valid JSON.");
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new RequestError("Send the reading item as a JSON object.");
  }

  const name = typeof data.name === "string" ? data.name.trim() : "";
  const description =
    typeof data.description === "string" ? data.description.trim() : "";
  const url = typeof data.url === "string" ? data.url.trim() : "";

  if (!name || name.length > 150) {
    throw new RequestError("Enter a title up to 150 characters long.");
  }

  if (!description || description.length > 3000) {
    throw new RequestError("Enter a description up to 3,000 characters long.");
  }

  if (!url || url.length > 2048) {
    throw new RequestError("Enter a reading link up to 2,048 characters long.");
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new RequestError("Enter a valid web link beginning with http:// or https://.");
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new RequestError("The reading link must use HTTP or HTTPS.");
  }

  return { name, description, url: parsedUrl.toString() };
}

export function errorResponse(error) {
  if (error instanceof RequestError) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  console.error("Reading list database request failed:", error);
  const databaseErrorCode =
    error && typeof error === "object" && "code" in error
      ? error.code
      : undefined;
  const databaseErrorMessage =
    error instanceof Error ? error.message : String(error);
  if (
    databaseErrorCode === "P1000" ||
    databaseErrorMessage.includes(
      "Authentication failed against database server",
    )
  ) {
    return Response.json(
      {
        error:
          "The database rejected its credentials. Update DATABASE_URL in .env with valid TiDB credentials, then restart the app.",
      },
      { status: 503 },
    );
  }

  return Response.json(
    { error: "The reading item could not be saved. Please try again." },
    { status: 500 },
  );
}
