const BASE_URL =
  "https://openapi.data.uwaterloo.ca/v3";

export async function uwFetch<T>(
  path: string
): Promise<T> {
  const apiKey =
    process.env.UW_OPEN_DATA_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Missing Waterloo Open Data API key"
    );
  }

  const response = await fetch(
    `${BASE_URL}${path}`,
    {
      headers: {
        "X-API-KEY": apiKey,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Waterloo API error: ${response.status}`
    );
  }

  return response.json() as Promise<T>;
}