import { router } from "../init";
import { abilitiesRouter } from "./abilities";
import { agentsRouter } from "./agents";
import { sessionsRouter } from "./sessions";
import { integrationsRouter } from "./integrations";
import { operationsRouter } from "./operations";

export const appRouter = router({
  abilities: abilitiesRouter,
  agents: agentsRouter,
  sessions: sessionsRouter,
  integrations: integrationsRouter,
  operations: operationsRouter,
});

export type AppRouter = typeof appRouter;
