import { createMachine, assign, fromPromise } from "xstate";
import { BadgeService } from "../service/badge-service.service";
import { orchestrator } from "#/core/Orchestrator";
import { UI_MACHINE_ID } from "./uiMachine";
import type { 
  Badge, 
  BadgeProgress, 
  BadgeStats
} from "../models/Badge";

export const BADGE_MACHINE_ID = "badge";
export const BADGE_MACHINE_EVENT_TYPES = [
  "SET_AUTH",
  "RESET",
  "LOAD_BADGES",
  "RELOAD_BADGES",
  "DATA_LOADED",
  "EVALUATE_BADGES",
];

export interface BadgeMachineContext {
  accessToken: string | null;
  userRole: string | null;
  userId: string | null;
  badges: Badge[];
  progress: BadgeProgress[];
  stats: BadgeStats | null;
  isLoadingBadges: boolean;
  isLoadingProgress: boolean;
  isEvaluating: boolean;
  badgesError: string | null;
  progressError: string | null;
  evaluationError: string | null;
  lastLoadedAt: string | null;
}

export type BadgeMachineEvent =
  | { type: "SET_AUTH"; accessToken: string; userId: string; userRole?: string }
  | { type: "RESET" }
  | { type: "LOAD_BADGES" }
  | { type: "RELOAD_BADGES" }
  | { type: "DATA_LOADED" }
  | { type: "EVALUATE_BADGES" };

const badgeMachine = createMachine({
  id: "badge",
  initial: "idle",

  context: {
    accessToken: null,
    userRole: null,
    userId: null,
    badges: [],
    progress: [],
    stats: null,
    isLoadingBadges: false,
    isLoadingProgress: false,
    isEvaluating: false,
    badgesError: null,
    progressError: null,
    evaluationError: null,
    lastLoadedAt: null,
  } as BadgeMachineContext,

  states: {
    idle: {
      always: [
        {
          guard: ({ context }) => !!context.accessToken && !!context.userId && isBadgeEligible(context),
          target: "loading",
        },
      ],
      on: {
        LOAD_BADGES: {
          guard: ({ context }) => !!context.accessToken && !!context.userId && isBadgeEligible(context),
          target: "loading",
        },
        RELOAD_BADGES: {
          guard: ({ context }) => !!context.accessToken && !!context.userId && isBadgeEligible(context),
          target: "loading",
        },
        EVALUATE_BADGES: {
          guard: ({ context }) => !!context.accessToken && !!context.userId && isBadgeEligible(context),
          target: "evaluating",
        },
      },
    },

    evaluating: {
      entry: assign({
        isEvaluating: true,
        evaluationError: null,
      }),

      invoke: {
        src: fromPromise(async ({ input }: { 
          input: { accessToken: string; userId: string; userRole: string } 
        }) => {
          await BadgeService.evaluateUserBadges(input.accessToken, input.userId, input.userRole);
        }),

        input: ({ context }) => ({
          accessToken: context.accessToken!,
          userId: context.userId!,
          userRole: context.userRole!,
        }),

        onDone: {
          target: "loading",
          actions: [
            assign({
              isEvaluating: false,
              evaluationError: null,
            }),
            () => {
              orchestrator.sendToMachine(UI_MACHINE_ID, { 
                type: "OPEN_SNACKBAR", 
                message: "Badges recalculados exitosamente", 
                severity: "success" 
              });
            }
          ],
        },

        onError: {
          target: "idle",
          actions: [
            assign({
              isEvaluating: false,
              evaluationError: ({ event }) => {
                const error = event.error as Error;
                return error?.message || "Error al evaluar badges";
              },
            }),
            ({ event }) => {
              const error = event.error as Error;
              console.error('[BadgeMachine] Error evaluating badges:', error);
              orchestrator.sendToMachine(UI_MACHINE_ID, { 
                type: "OPEN_SNACKBAR", 
                message: error?.message || "Error al recalcular badges", 
                severity: "error" 
              });
            }
          ],
        },
      },
    },

    loading: {
      entry: assign({
        isLoadingBadges: true,
        isLoadingProgress: true,
        badgesError: null,
        progressError: null,
      }),

      type: "parallel",

      states: {
        loadingBadges: {
          initial: "fetching",
          states: {
            fetching: {
              invoke: {
                src: fromPromise(async ({ input }: { 
                  input: { accessToken: string; userId: string; userRole: string } 
                }) => {
                  return await BadgeService.getUserBadges(input.accessToken, input.userId, input.userRole);
                }),

                input: ({ context }) => ({
                  accessToken: context.accessToken!,
                  userId: context.userId!,
                  userRole: context.userRole!,
                }),

                onDone: {
                  target: "success",
                  actions: assign({
                    badges: ({ event }) => event.output as Badge[],
                    isLoadingBadges: false,
                    badgesError: null,
                  }),
                },

                onError: {
                  target: "failure",
                  actions: [
                    assign({
                      isLoadingBadges: false,
                      badgesError: ({ event }) => {
                        const error = event.error as Error;
                        if (error?.message?.includes('Failed to fetch') || error?.message?.includes('fetch')) {
                          return "No se pudo conectar con el servidor. Verifica tu conexión.";
                        }
                        if (error?.message?.includes('404')) {
                          return "Badges no disponibles.";
                        }
                        if (error?.message?.includes('401') || error?.message?.includes('403')) {
                          return "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.";
                        }
                        return error?.message || "Error al cargar los badges. Inténtalo de nuevo.";
                      },
                    }),
                    ({ event }) => {
                      const error = event.error as Error;
                      console.error('[BadgeMachine] Error loading badges:', error);
                      orchestrator.sendToMachine(UI_MACHINE_ID, { 
                        type: "OPEN_SNACKBAR", 
                        message: error?.message || "Error al cargar los badges", 
                        severity: "error" 
                      });
                    }
                  ],
                },
              },
            },
            success: {
              type: "final",
            },
            failure: {
              type: "final",
            },
          },
        },

        loadingProgress: {
          initial: "fetching",
          states: {
            fetching: {
              invoke: {
                src: fromPromise(async ({ input }: { 
                  input: { accessToken: string; userId: string; userRole: string } 
                }) => {
                  return await BadgeService.getUserBadgeProgress(input.accessToken, input.userId, input.userRole);
                }),

                input: ({ context }) => ({
                  accessToken: context.accessToken!,
                  userId: context.userId!,
                  userRole: context.userRole!,
                }),

                onDone: {
                  target: "success",
                  actions: assign({
                    progress: ({ event }) => event.output as BadgeProgress[],
                    isLoadingProgress: false,
                    progressError: null,
                  }),
                },

                onError: {
                  target: "failure",
                  actions: [
                    assign({
                      isLoadingProgress: false,
                      progressError: ({ event }) => {
                        const error = event.error as Error;
                        if (error?.message?.includes('Failed to fetch') || error?.message?.includes('fetch')) {
                          return "No se pudo conectar con el servidor. Verifica tu conexión.";
                        }
                        if (error?.message?.includes('404')) {
                          return "Progreso de logros no disponible.";
                        }
                        if (error?.message?.includes('401') || error?.message?.includes('403')) {
                          return "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.";
                        }
                        return error?.message || "Error al cargar el progreso de logros. Inténtalo de nuevo.";
                      },
                    }),
                    ({ event }) => {
                      const error = event.error as Error;
                      console.error('[BadgeMachine] Error loading progress:', error);
                    }
                  ],
                },
              },
            },
            success: {
              type: "final",
            },
            failure: {
              type: "final",
            },
          },
        },
      },

      onDone: {
        target: "loaded",
        actions: assign({
          stats: ({ context }) => {
            return BadgeService.calculateBadgeStats(context.badges, context.progress);
          },
          lastLoadedAt: () => new Date().toISOString(),
        }),
      },
    },

    loaded: {
      on: {
        RELOAD_BADGES: {
          target: "loading",
        },
        EVALUATE_BADGES: {
          target: "evaluating",
        },
        DATA_LOADED: {
          actions: [
            ({ context }) => {
              if (context.accessToken && context.userId && context.lastLoadedAt && isBadgeEligible(context)) {
                const lastLoaded = new Date(context.lastLoadedAt).getTime();
                const now = new Date().getTime();
                const diffMinutes = (now - lastLoaded) / (1000 * 60);
                
                if (diffMinutes > 1) {
                  setTimeout(() => {
                    orchestrator.sendToMachine(BADGE_MACHINE_ID, { type: "RELOAD_BADGES" });
                  }, 500);
                }
              }
            }
          ],
        },
      },
    },

    error: {
      on: {
        LOAD_BADGES: {
          target: "loading",
        },
        RELOAD_BADGES: {
          target: "loading",
        },
        EVALUATE_BADGES: {
          target: "evaluating",
        },
      },
    },
  },

  on: {
    SET_AUTH: {
      actions: assign({
        accessToken: ({ event }) => event.accessToken,
        userRole: ({ event }) => event.userRole,
        userId: ({ event }) => event.userId,
      }),
    },
    RESET: {
      actions: assign({
        accessToken: null,
        userRole: null,
        userId: null,
        badges: [],
        progress: [],
        stats: null,
        badgesError: null,
        progressError: null,
        evaluationError: null,
        lastLoadedAt: null,
        isLoadingBadges: false,
        isLoadingProgress: false,
        isEvaluating: false,
      }),
    },
  },
});

export default badgeMachine;

const isBadgeEligible = (context: BadgeMachineContext) => {
  return ['DOCTOR', 'PATIENT'].includes(context.userRole || '');
};
