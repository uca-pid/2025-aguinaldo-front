import { createMachine, assign } from "xstate";

export const RATING_MACHINE_ID = "rating";
export const RATING_MACHINE_EVENT_TYPES = [
  "CLEAR_ACCESS_TOKEN"
];

export interface RatingMachineContext {
  rating: number;
  subcategories: string[];
  loading: boolean;
}

export const RatingMachineDefaultContext: RatingMachineContext = {
  rating: 0,
  subcategories: [],
  loading: false
};

export const ratingMachine = createMachine({
  id: RATING_MACHINE_ID,
  initial: "idle",
  context: RatingMachineDefaultContext,
  states: {
    idle: {
      on: {
        SET_RATING: {
          actions: assign({
            rating: ({ event }) => event.rating
          })
        },
        SET_SUBCATEGORIES: {
          actions: assign({
            subcategories: ({ event }) => event.subcategories
          })
        },
        RESET_RATING: {
          actions: assign({
            rating: 0,
            subcategories: []
          })
        },
        CLEAR_ACCESS_TOKEN: {
          actions: assign({
            rating: 0,
            subcategories: [],
            loading: false
          })
        },
        START_SUBMIT: {
          target: "submitting",
          actions: assign({
            loading: true
          })
        }
      }
    },
    submitting: {
      on: {
        SUBMIT_SUCCESS: {
          target: "idle",
          actions: assign({
            loading: false,
            rating: 0,
            subcategories: []
          })
        },
        SUBMIT_ERROR: {
          target: "idle",
          actions: assign({
            loading: false
          })
        },
        CLEAR_ACCESS_TOKEN: {
          target: "idle",
          actions: assign({
            rating: 0,
            subcategories: [],
            loading: false
          })
        }
      }
    }
  }
});