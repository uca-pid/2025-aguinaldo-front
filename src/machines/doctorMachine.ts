import { createMachine, assign, fromPromise } from "xstate";
import { saveDoctorAvailability, updateMedicalHistory } from "../utils/MachineUtils/doctorMachineUtils";
import { orchestrator } from "#/core/Orchestrator";
import { DATA_MACHINE_ID } from "./dataMachine";
import { UI_MACHINE_ID } from "./uiMachine";
import type { Patient } from "../models/Doctor";

export const DOCTOR_MACHINE_ID = "doctor";
export const DOCTOR_MACHINE_EVENT_TYPES = [
  "SET_AUTH",
  "RESET",
  "TOGGLE_DAY",
  "ADD_RANGE",
  "REMOVE_RANGE",
  "UPDATE_RANGE",
  "SAVE_AVAILABILITY",
  "SET_PATIENT_SEARCH",
  "SELECT_PATIENT",
  "CLEAR_PATIENT_SELECTION",
  "START_EDIT_HISTORY",
  "UPDATE_HISTORY",
  "SAVE_HISTORY",
  "DATA_LOADED"
];

interface Range {
  start: string;
  end: string;
}

interface DayAvailability {
  day: string;
  enabled: boolean;
  ranges: Range[];
}

export interface DoctorMachineContext {
  accessToken: string | null;
  doctorId: string | null;
  patientSearchTerm: string;
  
  patients: Patient[];
  selectedPatient: Patient | null;
  editedHistory: string;
  isSavingHistory: boolean;
  
  availability: DayAvailability[];
  isSavingAvailability: boolean;
  isLoadingAvailability: boolean;
  availabilityError: string | null;
}

export type DoctorMachineEvent =
  | { type: "SET_AUTH"; accessToken: string; userId: string; userRole?: string }
  | { type: "RESET" }
  | { type: "TOGGLE_DAY"; index: number }
  | { type: "ADD_RANGE"; dayIndex: number }
  | { type: "REMOVE_RANGE"; dayIndex: number; rangeIndex: number }
  | { type: "UPDATE_RANGE"; dayIndex: number; rangeIndex: number; field: "start" | "end"; value: string }
  | { type: "SAVE_AVAILABILITY" }
  | { type: "SET_PATIENT_SEARCH"; searchTerm: string }
  | { type: "SELECT_PATIENT"; patient: Patient }
  | { type: "CLEAR_PATIENT_SELECTION" }
  | { type: "START_EDIT_HISTORY" }
  | { type: "UPDATE_HISTORY"; value: string }
  | { type: "SAVE_HISTORY" }
  | { type: "DATA_LOADED" };

const doctorMachine = createMachine({
  id: "doctor",
  type: "parallel",

  context: {
    accessToken: null,
    doctorId: null,
    patientSearchTerm: "",
    

  selectedPatient: null,
  editedHistory: '',
  isSavingHistory: false,    availability: [
      { day: "Lunes", enabled: false, ranges: [{ start: "", end: "" }] },
      { day: "Martes", enabled: false, ranges: [{ start: "", end: "" }] },
      { day: "Miércoles", enabled: false, ranges: [{ start: "", end: "" }] },
      { day: "Jueves", enabled: false, ranges: [{ start: "", end: "" }] },
      { day: "Viernes", enabled: false, ranges: [{ start: "", end: "" }] },
      { day: "Sábado", enabled: false, ranges: [{ start: "", end: "" }] },
      { day: "Domingo", enabled: false, ranges: [{ start: "", end: "" }] },
    ],
    isSavingAvailability: false,
    isLoadingAvailability: false,
    availabilityError: null,
  } as DoctorMachineContext,

  states: {
    patientManagement: {
      initial: "idle",
      states: {
        idle: {
          on: {
            RESET: {
              actions: assign({
                selectedPatient: null,
                editedHistory: '',
                isSavingHistory: false,
              }),
            },
            SELECT_PATIENT: {
              actions: assign({
                selectedPatient: ({ event }) => event.patient,
                editedHistory: '',
                isSavingHistory: false,
              }),
            },
            CLEAR_PATIENT_SELECTION: {
              actions: assign({
                selectedPatient: null,
                editedHistory: '',
                isSavingHistory: false,
              }),
            },
            START_EDIT_HISTORY: {
              actions: [assign({
                editedHistory: ({ context }) => context.selectedPatient?.medicalHistory || '',
              })],
            },
            UPDATE_HISTORY: {
              actions: assign({
                editedHistory: ({ event }) => event.value,
              }),
            },
            SAVE_HISTORY: "savingHistory",
          },
        },
        
        savingHistory: {
          entry: assign({
            isSavingHistory: true,
          }),
          
          invoke: {
            src: fromPromise(async ({ input }: { 
              input: { 
                accessToken: string; 
                doctorId: string; 
                patientId: string; 
                medicalHistory: string; 
              } 
            }) => {
              return await updateMedicalHistory(input);
            }),

            input: ({ context }) => ({
              accessToken: context.accessToken!,
              doctorId: context.doctorId!,
              patientId: context.selectedPatient!.id,
              medicalHistory: context.editedHistory
            }),

            onDone: {
              target: "idle",
              actions: [
                assign({
                  isSavingHistory: false,
                  editedHistory: '',
                  selectedPatient: ({ context }) => 
                    context.selectedPatient 
                      ? { ...context.selectedPatient, medicalHistory: context.editedHistory }
                      : null,
                }),
                () => {

                  orchestrator.sendToMachine(UI_MACHINE_ID, { 
                    type: "OPEN_SNACKBAR", 
                    message: "Historial médico actualizado exitosamente", 
                    severity: "success" 
                  });

   
                  orchestrator.sendToMachine(DATA_MACHINE_ID, {
                    type: "RETRY_DOCTOR_PATIENTS"
                  });
                }
              ]
            },
            
            onError: {
              target: "idle",
              actions: [
                assign({
                  isSavingHistory: false,
                }),
                ({ event }) => {
                  const error = event.error as Error;
                  let errorMessage = "Error al actualizar el historial médico. Inténtalo de nuevo.";
                  
                  if (error?.message?.includes('Failed to fetch') || error?.message?.includes('fetch')) {
                    errorMessage = "No se pudo conectar con el servidor. Verifica tu conexión.";
                  } else if (error?.message?.includes('404')) {
                    errorMessage = "Paciente no encontrado.";
                  } else if (error?.message?.includes('401') || error?.message?.includes('403')) {
                    errorMessage = "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.";
                  } else if (error?.message) {
                    errorMessage = error.message;
                  }
                  
                  orchestrator.sendToMachine(UI_MACHINE_ID, { 
                    type: "OPEN_SNACKBAR", 
                    message: errorMessage, 
                    severity: "error" 
                  });
                }
              ]
            },
          },
        },
      },
    },

    availability: {
      initial: "idle",
      states: {
        idle: {
          on: {
            TOGGLE_DAY: {
              actions: assign({
                availability: ({ context, event }) =>
                  context.availability.map((d, i) =>
                    i === event.index ? { ...d, enabled: !d.enabled } : d
                  ),
              }),
            },
            ADD_RANGE: {
              actions: assign({
                availability: ({ context, event }) =>
                  context.availability.map((d, i) =>
                    i === event.dayIndex
                      ? { ...d, ranges: [...d.ranges, { start: "", end: "" }] }
                      : d
                  ),
              }),
            },
            REMOVE_RANGE: {
              actions: assign({
                availability: ({ context, event }) =>
                  context.availability.map((d, i) =>
                    i === event.dayIndex
                      ? {
                          ...d,
                          ranges: d.ranges.filter((_, r) => r !== event.rangeIndex),
                        }
                      : d
                  ),
              }),
            },
            UPDATE_RANGE: {
              actions: assign({
                availability: ({ context, event }) =>
                  context.availability.map((d, i) =>
                    i === event.dayIndex
                      ? {
                          ...d,
                          ranges: d.ranges.map((r, ri) =>
                            ri === event.rangeIndex
                              ? { ...r, [event.field]: event.value }
                              : r
                          ),
                        }
                      : d
                  ),
              }),
            },
            SAVE_AVAILABILITY: "saving",
          },
        },
        
        saving: {
          entry: assign({
            isSavingAvailability: true,
            availabilityError: null
          }),
          
          invoke: {
            src: fromPromise(async ({ input }: { input: { accessToken: string; doctorId: string; availability: DayAvailability[] } }) => {
              return await saveDoctorAvailability(input);
            }),

            input: ({ context }) => ({
              accessToken: context.accessToken!,
              doctorId: context.doctorId!,
              availability: context.availability
            }),

            onDone: { 
              target: "idle",
              actions: [
                assign({
                  availabilityError: () => null,
                  isSavingAvailability: false
                }),
                () => {
                  orchestrator.sendToMachine(UI_MACHINE_ID, { 
                    type: "OPEN_SNACKBAR", 
                    message: "Disponibilidad guardada exitosamente", 
                    severity: "success" 
                  });
                }
              ]
            },
            onError: { 
              target: "idle",
              actions: [
                assign({
                  availabilityError: ({ event }) => {
                    const error = event.error as Error;
                    if (error?.message?.includes('Failed to fetch') || error?.message?.includes('fetch')) {
                      return "No se pudo conectar con el servidor. Verifica tu conexión.";
                    }
                    if (error?.message?.includes('404')) {
                      return "Servicio no disponible. Inténtalo más tarde.";
                    }
                    if (error?.message?.includes('401') || error?.message?.includes('403')) {
                      return "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.";
                    }
                    return error?.message || "Error al guardar la disponibilidad. Inténtalo de nuevo.";
                  },
                  isSavingAvailability: false
                }),
                ({ event }) => {
                  const error = event.error as Error;
                  const errorMessage = error?.message || "Error al guardar la disponibilidad. Inténtalo de nuevo.";
                  orchestrator.sendToMachine(UI_MACHINE_ID, { 
                    type: "OPEN_SNACKBAR", 
                    message: errorMessage, 
                    severity: "error" 
                  });
                }
              ]
            },
          },
        },
      },
    },
  },

  on: {
    SET_AUTH: {
      actions: assign({
        accessToken: ({ event }) => event.accessToken,
        doctorId: ({ event }) => event.userId, 
      }),
    },
    SET_PATIENT_SEARCH: {
      actions: assign({
        patientSearchTerm: ({ event }) => event.searchTerm,
      }),
    },
    DATA_LOADED: {
      actions: assign(() => {
        try {
          const dataSnapshot = orchestrator.getSnapshot(DATA_MACHINE_ID);
          const dataContext = dataSnapshot.context;
          
          const dayMapping: { [key: string]: string } = {
            "MONDAY": "Lunes",
            "TUESDAY": "Martes", 
            "WEDNESDAY": "Miércoles",
            "THURSDAY": "Jueves",
            "FRIDAY": "Viernes",
            "SATURDAY": "Sábado",
            "SUNDAY": "Domingo"
          };
          
          const availabilityData = dataContext.doctorAvailability as any;
          if (availabilityData && availabilityData.weeklyAvailability && availabilityData.weeklyAvailability.length > 0) {
            return {
              availability: availabilityData.weeklyAvailability.map((day: any) => ({
                day: dayMapping[day.day] || day.day,
                enabled: day.enabled,
                ranges: day.ranges || [{ start: "", end: "" }]
              })),
              patients: dataContext.doctorPatients || [],
              isLoadingAvailability: false,
              availabilityError: null,
            };
          }
          
          return {
            patients: dataContext.doctorPatients || [],
            isLoadingAvailability: false,
            availabilityError: null,
            availability: [
              { day: "Lunes", enabled: false, ranges: [{ start: "", end: "" }] },
              { day: "Martes", enabled: false, ranges: [{ start: "", end: "" }] },
              { day: "Miércoles", enabled: false, ranges: [{ start: "", end: "" }] },
              { day: "Jueves", enabled: false, ranges: [{ start: "", end: "" }] },
              { day: "Viernes", enabled: false, ranges: [{ start: "", end: "" }] },
              { day: "Sábado", enabled: false, ranges: [{ start: "", end: "" }] },
              { day: "Domingo", enabled: false, ranges: [{ start: "", end: "" }] },
            ],
          };
        } catch (error) {
          console.warn("Could not get dataMachine snapshot:", error);
          return {};
        }
      }),
    },
  },
});

export default doctorMachine;