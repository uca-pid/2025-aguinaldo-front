import { createMachine, assign } from "xstate";

export interface UiMachineContext {
  toggleStates?: Record<string, boolean>;
  anchorEls?: Record<string, HTMLElement | null>;
}

export type UiMachineEvent =
  | { type: "TOGGLE"; key: string }
  | { type: "OPEN_MENU"; key: string; anchorEl: HTMLElement }
  | { type: "CLOSE_MENU"; key: string };

export const homeHeaderMachine = createMachine({
  id: "homeHeader",
  initial: "idle",
  context: {  },
  types: {
    context: {} as UiMachineContext,
    events: {} as UiMachineEvent,
  },
  states: {
    idle: {
      on: {
        OPEN_MENU: {
          actions: assign({
            anchorEls: ({ context, event }) => ({
              ...context.anchorEls,
              [event.key]: event.anchorEl,
            }),
          }),
        },
        CLOSE_MENU: {
          actions: assign({
            anchorEls: ({ context, event }) => ({
              ...context.anchorEls,
              [event.key]: null,
            }),
          }),
        },
      },
    },
  }

} as const);
