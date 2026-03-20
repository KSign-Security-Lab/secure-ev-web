import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "~/server/trpc/routers/app";
import { createContext } from "~/server/trpc/init";
// Validate environment variables at startup
import "~/config/env";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => createContext(),
    onError:
      process.env.NODE_ENV === "development"
        ? ({ path, error }) => {
            // eslint-disable-next-line no-console
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
            );
          }
        : undefined,
  });

export { handler as GET, handler as POST };
