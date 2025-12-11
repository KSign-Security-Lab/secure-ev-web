import { router } from "../init";
import { abilitiesRouter } from "./abilities";
import { agentsRouter } from "./agents";
import { sessionsRouter } from "./sessions";
import { fuzzingRouter } from "./fuzzing";

export const appRouter = router({
  abilities: abilitiesRouter,
  agents: agentsRouter,
  sessions: sessionsRouter,
  fuzzing: fuzzingRouter,
});

export type AppRouter = typeof appRouter;
