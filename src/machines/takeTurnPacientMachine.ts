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
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "RESET" };

export const takeTurnPacientMachine = createMachine({
  id: "takeTurnPacient",
  initial: "step1",
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
    step1: {
      on: {
        UPDATE_FORM: {
          actions: assign({
            formValues: ({ context, event }) => ({
              ...context.formValues,
              [event.key]: event.value
            }),
          })
        },
        NEXT: "step2",
        RESET: {
          target: "step1",
          actions: assign({
            formValues: {
              professionSelected: "",
              profesionalSelected: "",
              dateSelected: null,
              timeSelected: null,
              reason: ""
            }
          })
      },
      
    },
    },
    step2:{
      on: {
      UPDATE_FORM: {
        actions: assign({
          formValues: ({ context, event }) => ({
            ...context.formValues,
            [event.key]: event.value
          }),
        })
      },
      BACK: "step1",
      RESET:{
        target: "step1",
        actions:assign({
          formValues: {
            professionSelected: "",
            profesionalSelected: "",
            dateSelected: null,
            timeSelected: null,
            reason: ""
          }
        })
      }
            
      }   
    }
  },
  
});
