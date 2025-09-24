import { createMachine, assign, fromPromise } from "xstate";
import { loadDoctorPatients, loadDoctorAvailability, saveDoctorAvailability } from "../utils/doctorMachineUtils";
import type { Patient } from "../models/Doctor";

export const DOCTOR_MACHINE_ID = "doctor";
export const DOCTOR_MACHINE_EVENT_TYPES = [
  "LOAD_PATIENTS",
  "SET_AUTH",
  "RETRY",
  "RESET",
  "TOGGLE_DAY",
  "ADD_RANGE",
  "REMOVE_RANGE",
  "UPDATE_RANGE",
  "SAVE_AVAILABILITY",
  "LOAD_AVAILABILITY",
  "SET_PATIENT_SEARCH",
  "INIT_AVAILABILITY_PAGE",
  "INIT_PATIENTS_PAGE"
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
  patients: Patient[];
  isLoadingPatients: boolean;
  patientsError: string | null;
  accessToken: string | null;
  doctorId: string | null;
  patientSearchTerm: string;
  
  availability: DayAvailability[];
  isSavingAvailability: boolean;
  isLoadingAvailability: boolean;
  availabilityError: string | null;
}

export type DoctorMachineEvent =
  | { type: "LOAD_PATIENTS" }
  | { type: "SET_AUTH"; accessToken: string; userId: string; userRole?: string }
  | { type: "RETRY" }
  | { type: "RESET" }
  | { type: "TOGGLE_DAY"; index: number }
  | { type: "ADD_RANGE"; dayIndex: number }
  | { type: "REMOVE_RANGE"; dayIndex: number; rangeIndex: number }
  | { type: "UPDATE_RANGE"; dayIndex: number; rangeIndex: number; field: "start" | "end"; value: string }
  | { type: "SAVE_AVAILABILITY" }
  | { type: "LOAD_AVAILABILITY" }
  | { type: "SET_PATIENT_SEARCH"; searchTerm: string }
  | { type: "INIT_AVAILABILITY_PAGE" }
  | { type: "INIT_PATIENTS_PAGE" };

const doctorMachine = createMachine({
  id: "doctor",
  type: "parallel",

  context: {
    patients: [],
    isLoadingPatients: false,
    patientsError: null,
    accessToken: null,
    doctorId: null,
    patientSearchTerm: "",
    
    availability: [
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
            LOAD_PATIENTS: {
              target: "loadingPatients",
              guard: ({ context }) => !!context.accessToken && !!context.doctorId,
            },
          },
        },

        loadingPatients: {
          entry: assign({
            isLoadingPatients: true,
            patientsError: null,
          }),

          invoke: {
            src: fromPromise(async ({ input }: { input: { accessToken: string; doctorId: string } }) => {
              return await loadDoctorPatients(input);
            }),

            input: ({ context }) => ({
              accessToken: context.accessToken!,
              doctorId: context.doctorId!,
            }),

            onDone: {
              target: "success",
              actions: assign({
                patients: ({ event }) => event.output,
                isLoadingPatients: false,
                patientsError: null,
              }),
            },

            onError: {
              target: "error",
              actions: assign({
                isLoadingPatients: false,
                patientsError: "Error al cargar pacientes",
              }),
            },
          },
        },

        success: {
          on: {
            LOAD_PATIENTS: "loadingPatients",
            RETRY: "loadingPatients",
          },
        },

        error: {
          on: {
            RETRY: "loadingPatients",
            RESET: {
              target: "idle",
              actions: assign({
                patients: [],
                patientsError: null,
              }),
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
            LOAD_AVAILABILITY: "loading",
          },
        },
      
        loading: {
          entry: assign({
            isLoadingAvailability: true,
            availabilityError: null
          }),
          
          invoke: {
            src: fromPromise(async ({ input }: { input: { accessToken: string; doctorId: string } }) => {
              return await loadDoctorAvailability(input);
            }),

            input: ({ context }) => ({
              accessToken: context.accessToken!,
              doctorId: context.doctorId!
            }),

            onDone: { 
              target: "idle",
              actions: assign({
                availability: ({ event, context }) => {
                  const response = event.output as any;
                  
                  const dayMapping: { [key: string]: string } = {
                    "MONDAY": "Lunes",
                    "TUESDAY": "Martes", 
                    "WEDNESDAY": "Miércoles",
                    "THURSDAY": "Jueves",
                    "FRIDAY": "Viernes",
                    "SATURDAY": "Sábado",
                    "SUNDAY": "Domingo"
                  };
                  
                  if (response && response.weeklyAvailability && response.weeklyAvailability.length > 0) {
                    console.log('Loading availability from API:', response.weeklyAvailability);
                    
                    return response.weeklyAvailability.map((day: any) => ({
                      day: dayMapping[day.day] || day.day,
                      enabled: day.enabled,
                      ranges: day.ranges || [{ start: "", end: "" }]
                    }));
                  }
                  
                  console.log('No availability data received, using default availability');
                  return context.availability;
                },
                availabilityError: () => null,
                isLoadingAvailability: false
              })
            },
            onError: { 
              target: "idle",
              actions: assign({
                availabilityError: ({ event }) => {
                  const error = event.error as Error;
                  if (error?.message?.includes('Failed to fetch') || error?.message?.includes('fetch')) {
                    return "No se pudo conectar con el servidor. Verifica tu conexión.";
                  }
                  if (error?.message?.includes('404')) {
                    return "Disponibilidad no encontrada. Se usará la configuración por defecto.";
                  }
                  if (error?.message?.includes('401') || error?.message?.includes('403')) {
                    return "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.";
                  }
                  return error?.message || "Error al cargar la disponibilidad.";
                }, 
                isLoadingAvailability: false
              })
            },
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
              actions: assign({
                availabilityError: () => null,
                isSavingAvailability: false
              })
            },
            onError: { 
              target: "idle",
              actions: assign({
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
              })
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
        doctorId: ({ event }) => event.userId, // For doctors, userId is the same as doctorId
      }),
    },
    SET_PATIENT_SEARCH: {
      actions: assign({
        patientSearchTerm: ({ event }) => event.searchTerm,
      }),
    },
    INIT_AVAILABILITY_PAGE: {
      actions: ({ context, self }) => {
        if (context.accessToken && context.doctorId) {
          self.send({ type: "LOAD_AVAILABILITY" });
        }
      },
    },
    INIT_PATIENTS_PAGE: {
      actions: ({ context, self }) => {
        if (context.accessToken && context.doctorId) {
          self.send({ type: "LOAD_PATIENTS" });
        }
      },
    },
  },
});

export default doctorMachine;