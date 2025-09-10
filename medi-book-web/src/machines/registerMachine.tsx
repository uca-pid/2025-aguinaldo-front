import { createMachine, assign } from "xstate";
import type { AssignAction } from "xstate";

export interface RegisterContext {
  formType: "patient" | "doctor";
  fade: "in" | "out";
  nextFormType?: "patient" | "doctor"; // Nuevo
}

export type RegisterEvent =
  | { type: "SWITCH_FORM"; formType: "patient" | "doctor" }
  | { type: "FADE_OUT_DONE" };

const setFade: AssignAction<RegisterContext, RegisterEvent, unknown, RegisterEvent, any> = assign({
  fade: (_) => "out",
  nextFormType: (_, event) => {
    // Type guard seguro
    if (typeof event === "object" && event !== null && "type" in event && event.type === "SWITCH_FORM") {
      return (event as { type: "SWITCH_FORM"; formType: "patient" | "doctor" }).formType;
    }
    return undefined;
  },
});


const setFormType: AssignAction<RegisterContext, RegisterEvent, unknown, RegisterEvent, any> = assign({
  formType: (context) => {
    const ctx = context as unknown as RegisterContext; // <-- casteo seguro
    return ctx.nextFormType ?? ctx.formType;
  },
  fade: (_) => "in",
  nextFormType: (_) => undefined,
});


export const registerMachine = createMachine<
  RegisterContext,
  RegisterEvent,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any
>({
  id: "register",
  initial: "active",
  context: { formType: "patient", fade: "in" },
  states: {
    active: {
      on: {
        SWITCH_FORM: { actions: setFade },
        FADE_OUT_DONE: { actions: setFormType },
      },
    },
  },
} as const);
