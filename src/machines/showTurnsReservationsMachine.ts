import { createMachine, assign } from "xstate";
import { Dayjs } from "dayjs";
export interface ShowTurnsReservationsMachineContext {
  formValues:{
    dateSelected: Dayjs | null; 
  }
}

export type ShowTurnsReservationsMachineEvent =
  | { type: "UPDATE_FORM"; key: string; value: any }
  | { type: "RESET" };

export const showTurnReservationMachine = createMachine({
  id: "takeTurnPacient",
  initial: "idle",
  context: {  
    formValues:{
      dateSelected: null
    }
  },
  types: {
    context: {} as ShowTurnsReservationsMachineContext,
    events: {} as ShowTurnsReservationsMachineEvent,
  },
  states: {
    idle: {
      on: {
        UPDATE_FORM: {
          actions: assign({
            formValues: ({ context, event }) => ({
              ...context.formValues,
              [event.key]: event.value
            }),
          })
        },
        
        RESET: {
          target: "idle",
          actions: assign({
            formValues: {
              dateSelected: null,
            }
          })
      },
      
    },
    },
    
  },
  
});
