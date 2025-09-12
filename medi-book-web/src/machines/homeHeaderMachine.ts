import { createMachine, assign } from "xstate";

export interface HomeHeaderMachineContext {
  anchorEls?: Record<string, HTMLElement | null>;
}

export type HomeHeaderMachineEvent =
  | { type: "OPEN_MENU"; key: string; anchorEl: HTMLElement }
  | { type: "CLOSE_MENU"; key: string };

export const homeHeaderMachine = createMachine({
  id: "homeHeader",
  initial: "idle",
  context: {  },
  types: {
    context: {} as HomeHeaderMachineContext,
    events: {} as HomeHeaderMachineEvent,
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

});
