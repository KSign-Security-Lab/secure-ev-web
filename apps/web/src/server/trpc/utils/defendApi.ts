import { TRPCError } from "@trpc/server";
import { env } from "~/config/env";

/**
 * Shared client for the external defend (Caldera) API.
 *
 * Every call goes through the same base URL, the same `Key` auth header and the
 * same error translation, so routers only have to care about the path and the
 * response shape.
 */
export async function defendFetch(
  path: string,
  init?: { method?: string; body?: unknown }
): Promise<unknown> {
  const endpoint = new URL(path, env.DEFEND_API_URL);

  const response = await fetch(endpoint, {
    method: init?.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      Key: env.DEFEND_API_KEY,
    },
    body: init?.body === undefined ? undefined : JSON.stringify(init.body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Defend API request failed (${path}): ${response.status} ${text}`,
    });
  }

  return response.json();
}
