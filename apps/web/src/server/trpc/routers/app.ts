import { router } from "../init";
import { abilitiesRouter } from "./abilities";
import { agentsRouter } from "./agents";
import { sessionsRouter } from "./sessions";
import { fuzzingRouter } from "./fuzzing";
import { integrationsRouter } from "./integrations";

export const appRouter = router({
  abilities: abilitiesRouter,
  agents: agentsRouter,
  sessions: sessionsRouter,
  fuzzing: fuzzingRouter,
  integrations: integrationsRouter,
});

export type AppRouter = typeof appRouter;
