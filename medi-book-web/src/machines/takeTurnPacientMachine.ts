import { createMachine, assign } from "xstate";
import { Dayjs } from "dayjs";
export interface TakeTurnPacientMachineContext {
  formValues:{
    professionSelected:string;
    profesionalSelected:string; 
    dateSelected: Dayjs | null; 
    timeSelected: Dayjs | null; 
    reason:string
  }
}

export type TakeTurnPacientMachineEvent =
  | { type: "UPDATE_FORM"; key: string; value: any }
  

export const takeTurnPacientMachine = createMachine({
  id: "takeTurnPacient",
  initial: "idle",
  context: {  
    formValues:{
      professionSelected:"",profesionalSelected:"", dateSelected: null, timeSelected: null, reason:""
    }
  },
  types: {
    context: {} as TakeTurnPacientMachineContext,
    events: {} as TakeTurnPacientMachineEvent,
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
        }
      },
      
    },
  },
  
});
