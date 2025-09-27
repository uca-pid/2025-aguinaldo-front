import { createMachine, assign } from "xstate";
import { orchestrator } from "#/core/Orchestrator";
import { DATA_MACHINE_ID } from "./dataMachine";
import type { Patient } from "../models/Doctor";

export const PATIENT_DETAILS_MACHINE_ID = "patientDetails";
export const PATIENT_DETAILS_MACHINE_EVENT_TYPES = [
  "SET_AUTH",
  "DATA_LOADED",
  "SELECT_PATIENT",
  "CLEAR_SELECTION", 
  "INIT_PATIENT_DETAILS_PAGE",
  "RETRY",
  "RESET"
];

export interface PatientDetailsMachineContext {
  selectedPatient: Patient | null;
  isLoadingPatient: boolean;
  patientError: string | null;
  accessToken: string | null;
  doctorId: string | null;
}

export type PatientDetailsMachineEvent =
  | { type: "SET_AUTH"; accessToken: string; userId: string; userRole?: string }
  | { type: "DATA_LOADED" }
  | { type: "SELECT_PATIENT"; patient: Patient }
  | { type: "CLEAR_SELECTION" }
  | { type: "INIT_PATIENT_DETAILS_PAGE"; patientId: string }
  | { type: "RETRY" }
  | { type: "RESET" };

const patientDetailsMachine = createMachine({
  id: "patientDetails",
  initial: "idle",

  context: {
    selectedPatient: null,
    isLoadingPatient: false,
    patientError: null,
    accessToken: null,
    doctorId: null,
  } as PatientDetailsMachineContext,

  states: {
    idle: {
      on: {
        SELECT_PATIENT: {
          actions: assign({
            selectedPatient: ({ event }) => event.patient,
            patientError: null,
          }),
        },
        INIT_PATIENT_DETAILS_PAGE: {
          actions: [
            assign({
              isLoadingPatient: true,
              patientError: null,
            }),
            ({ context, event }) => {
              console.log("PatientDetailsMachine: INIT_PATIENT_DETAILS_PAGE received", {
                accessToken: !!context.accessToken,
                doctorId: context.doctorId,
                patientId: event.patientId
              });
              
              if (context.accessToken && context.doctorId) {
                console.log("PatientDetailsMachine: Requesting patient data load");
                orchestrator.send({ type: "LOAD_DOCTOR_PATIENTS" });
              } else {
                console.warn("PatientDetailsMachine: Missing accessToken or doctorId", {
                  accessToken: !!context.accessToken,
                  doctorId: context.doctorId
                });
              }
            }
          ],
        },
        DATA_LOADED: {
          actions: assign(() => {
            try {
              const dataSnapshot = orchestrator.getSnapshot(DATA_MACHINE_ID);
              const dataContext = dataSnapshot.context;
              const error = dataContext.errors?.doctorPatients;
              
              return {
                isLoadingPatient: false,
                patientError: error || null,
              };
            } catch (error) {
              console.warn("Could not get dataMachine snapshot:", error);
              return {
                isLoadingPatient: false,
                patientError: "Error al conectar con el sistema de datos",
              };
            }
          }),
        },
        RETRY: {
          actions: [
            assign({
              isLoadingPatient: true,
              patientError: null,
            }),
            ({ context }) => {
              if (context.accessToken && context.doctorId) {
                orchestrator.send({ type: "LOAD_DOCTOR_PATIENTS" });
              }
            }
          ],
        },
        CLEAR_SELECTION: {
          actions: assign({
            selectedPatient: null,
            patientError: null,
          }),
        },
        RESET: {
          actions: assign({
            selectedPatient: null,
            patientError: null,
            isLoadingPatient: false,
          }),
        },
      },
    },
  },

  on: {
    SET_AUTH: {
      actions: assign({
        accessToken: ({ event }) => event.accessToken,
        doctorId: ({ event }) => event.userId, // For doctors, userId is the same as doctorId
      }),
    },
  },
});

export default patientDetailsMachine;