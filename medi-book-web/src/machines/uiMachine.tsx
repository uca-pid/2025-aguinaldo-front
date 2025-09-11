import { createMachine, assign } from "xstate";

export interface UiMachineContext {
  toggleStates?: Record<string, boolean>; // Pares clave-booleano ejemplo: { darkMode: true }
}

export type UiMachineEvent =
  | { type: "TOGGLE"; key: string } // Evento para alternar el estado de una clave específica
                                    //ejemplo: { type: "TOGGLE"; key: "darkMode" }

export const uiMachine = createMachine({
  id: "ui",
  initial: "idle", // Estado inicial
  context: {  }, // Contexto inicial vacío
  types: {  // Qué tipos de contexto y eventos maneja la máquina
    context: {} as UiMachineContext,
    events: {} as UiMachineEvent,
  },
  states: { // Definición de estados y transiciones
    idle: {
      on: { // Qué hacer en respuesta a eventos estando en el estado 'idle'
        TOGGLE: { // Si se recibe el evento 'TOGGLE'
          actions: assign({ // Actualizar el contexto
            toggleStates: ({context, event}) => ({ // Función para actualizar toggleStates
              ...context.toggleStates, // Mantener los estados actuales
              [event.key]: !context.toggleStates?.[event.key], // Alternar el estado de la clave especificada
            }), 
          }),
        },
      },
    },
  },
} as const);
