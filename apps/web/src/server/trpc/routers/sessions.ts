import { router, publicProcedure } from "../init";
import { env } from "~/config/env";
import { sessionsListResponseSchema } from "../schemas/responses";

export const sessionsRouter = router({
  list: publicProcedure.output(sessionsListResponseSchema).query(async () => {
    const response = await fetch(env.MANX_SESSIONS_URL, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to fetch sessions: ${response.status} ${text}`);
    }

    const data = await response.json();
    // Validate and parse the response
    const parsed = sessionsListResponseSchema.parse(data);
    return parsed;
  }),
});

