import { createMachine, assign, fromPromise } from "xstate";
import { Dayjs } from "dayjs";
import { TurnService } from "../service/turn-service.service";
import { DoctorService, type DoctorAvailabilityRequest } from "../service/doctor-service.service";
import type { Doctor, TurnResponse } from "../models/Turn";

export const TURN_MACHINE_ID = "turn";
export const TURN_MACHINE_EVENT_TYPES = [
  "UPDATE_FORM_TAKE_TURN",
  "UPDATE_FORM_SHOW_TURNS",
  "NEXT",
  "BACK",
  "RESET_TAKE_TURN",
  "RESET_SHOW_TURNS",
  "LOAD_DOCTORS",
  "LOAD_AVAILABLE_TURNS",
  "LOAD_MY_TURNS",
  "RESERVE_TURN",
  "CREATE_TURN",
  "SET_AUTH",
  "API_SUCCESS",
  "API_ERROR",
  "TOGGLE_DAY",
  "ADD_RANGE",
  "REMOVE_RANGE",
  "UPDATE_RANGE",
  "SAVE_AVAILABILITY",
  "LOAD_AVAILABILITY"
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

export interface TurnMachineContext {
  doctors: Doctor[];
  availableTurns: string[];
  myTurns: TurnResponse[];
  
  isLoadingDoctors: boolean;
  isLoadingAvailableTurns: boolean;
  isLoadingMyTurns: boolean;
  isCreatingTurn: boolean;
  isReservingTurn: boolean;
  isSavingAvailability: boolean;
  isLoadingAvailability: boolean;
  
  error: string | null;
  doctorsError: string | null;
  availableError: string | null;
  myTurnsError: string | null;
  reserveError: string | null;
  
  takeTurn: {
    professionSelected: string;
    profesionalSelected: string;
    doctorId: string;
    dateSelected: Dayjs | null;
    timeSelected: Dayjs | null;
    scheduledAt: string | null;
    reason: string;
  };
  showTurns: {
    dateSelected: Dayjs | null;
    statusFilter: string;
  };
  
  accessToken: string | null;
  userId: string | null;

  availability: DayAvailability[];
}

export type TurnMachineEvent =
  | { type: "UPDATE_FORM_TAKE_TURN"; key: string; value: any }
  | { type: "UPDATE_FORM_SHOW_TURNS"; key: string; value: any }
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "RESET_TAKE_TURN" }
  | { type: "RESET_SHOW_TURNS" }
  | { type: "LOAD_DOCTORS" }
  | { type: "LOAD_AVAILABLE_TURNS"; doctorId: string; date: string }
  | { type: "LOAD_MY_TURNS"; status?: string }
  | { type: "RESERVE_TURN"; turnId: string }
  | { type: "CREATE_TURN" }
  | { type: "SET_AUTH"; accessToken: string; userId: string }
  | { type: "API_SUCCESS"; data: any; action: string }
  | { type: "API_ERROR"; error: string; action: string }
  | { type: "TOGGLE_DAY"; index: number }
  | { type: "ADD_RANGE"; dayIndex: number }
  | { type: "REMOVE_RANGE"; dayIndex: number; rangeIndex: number }
  | { type: "UPDATE_RANGE"; dayIndex: number; rangeIndex: number; field: "start" | "end"; value: string }
  | { type: "SAVE_AVAILABILITY" }
  | { type: "LOAD_AVAILABILITY" };

export const turnMachine = createMachine({
  id: "turnMachine",
  type: "parallel", 
  context: {
    doctors: [],
    availableTurns: [],
    myTurns: [],
    
    isLoadingDoctors: false,
    isLoadingAvailableTurns: false,
    isLoadingMyTurns: false,
    isCreatingTurn: false,
    isReservingTurn: false,
    isSavingAvailability: false,
    isLoadingAvailability: false,
    
    error: null,
    doctorsError: null,
    availableError: null,
    myTurnsError: null,
    reserveError: null,
    
    takeTurn: {
      professionSelected: "",
      profesionalSelected: "",
      doctorId: "",
      dateSelected: null,
      timeSelected: null,
      scheduledAt: null,
      reason: "",
    },
    showTurns: {
      dateSelected: null,
      statusFilter: "",
    },
    
    accessToken: null,
    userId: null,


    availability: [
    { day: "Lunes", enabled: false, ranges: [{ start: "", end: "" }] },
    { day: "Martes", enabled: false, ranges: [{ start: "", end: "" }] },
    { day: "Miércoles", enabled: false, ranges: [{ start: "", end: "" }] },
    { day: "Jueves", enabled: false, ranges: [{ start: "", end: "" }] },
    { day: "Viernes", enabled: false, ranges: [{ start: "", end: "" }] },
    { day: "Sábado", enabled: false, ranges: [{ start: "", end: "" }] },
    { day: "Domingo", enabled: false, ranges: [{ start: "", end: "" }] },
  ],
  } as TurnMachineContext,
  types: {
    context: {} as TurnMachineContext,
    events: {} as TurnMachineEvent,
  },
  states: {
    takeTurn: {
      initial: "step1",
      states: {
        step1: {
          on: {
            UPDATE_FORM_TAKE_TURN: {
              actions: assign({
                takeTurn: ({ context, event }) => ({
                  ...context.takeTurn,
                  [event.key]: event.value,
                }),
              }),
            },
            NEXT: "step2",
            RESET_TAKE_TURN: {
              target: "step1",
              actions: assign({
                takeTurn: {
                  professionSelected: "",
                  profesionalSelected: "",
                  doctorId: "",
                  dateSelected: null,
                  timeSelected: null,
                  scheduledAt: null,
                  reason: "",
                },
              }),
            },
          },
        },
        step2: {
          on: {
            UPDATE_FORM_TAKE_TURN: {
              actions: assign({
                takeTurn: ({ context, event }) => ({
                  ...context.takeTurn,
                  [event.key]: event.value,
                }),
              }),
            },
            BACK: "step1",
            RESET_TAKE_TURN: {
              target: "step1",
              actions: assign({
                takeTurn: {
                  professionSelected: "",
                  profesionalSelected: "",
                  doctorId: "",
                  dateSelected: null,
                  timeSelected: null,
                  scheduledAt: null,
                  reason: "",
                },
              }),
            },
          },
        },
      },
    },
    showTurns: {
      initial: "idle",
      states: {
        idle: {
          on: {
            UPDATE_FORM_SHOW_TURNS: {
              actions: assign({
                showTurns: ({ context, event }) => ({
                  ...context.showTurns,
                  [event.key]: event.value,
                }),
              }),
            },
            RESET_SHOW_TURNS: {
              target: "idle",
              actions: assign({
                showTurns: { 
                  dateSelected: null,
                  statusFilter: "",
                },
              }),
            },
          },
        },
      },
    },
    dataManagement: {
      initial: "idle",
      states: {
        idle: {
          on: {
            SET_AUTH: {
              actions: assign({
                accessToken: ({ event }) => event.accessToken,
                userId: ({ event }) => event.userId,
              }),
            },
            LOAD_DOCTORS: {
              target: "loadingDoctors",
            },
            LOAD_AVAILABLE_TURNS: {
              target: "loadingAvailableTurns",
            },
            LOAD_MY_TURNS: {
              target: "loadingMyTurns",
            },
            RESERVE_TURN: {
              target: "reservingTurn",
            },
            CREATE_TURN: {
              target: "creatingTurn",
            },
          },
        },
        loadingDoctors: {
          entry: assign({
            isLoadingDoctors: true,
            doctorsError: null,
          }),
          invoke: {
            src: fromPromise(async ({ input }: { input: { accessToken: string } }) => {
              return await TurnService.getDoctors(input.accessToken);
            }),
            input: ({ context }) => ({ accessToken: context.accessToken }),
            onDone: {
              target: "idle",
              actions: assign({
                doctors: ({ event }) => event.output,
                isLoadingDoctors: false,
                doctorsError: null,
              }),
            },
            onError: {
              target: "idle",
              actions: assign({
                isLoadingDoctors: false,
                doctorsError: ({ event }) => (event.error as Error)?.message || "Error loading doctors",
              }),
            },
          },
        },
        loadingAvailableTurns: {
          entry: assign({
            isLoadingAvailableTurns: true,
            availableError: null,
          }),
          invoke: {
            src: fromPromise(async ({ input }: { input: { accessToken: string; doctorId: string; date: string } }) => {
              return await TurnService.getAvailableTurns(
                input.doctorId, 
                input.date, 
                input.accessToken
              );
            }),
            input: ({ context, event }) => ({
              accessToken: context.accessToken!,
              doctorId: (event as any).doctorId,
              date: (event as any).date
            }),
            onDone: {
              target: "idle",
              actions: assign({
                availableTurns: ({ event }) => event.output,
                isLoadingAvailableTurns: false,
                availableError: null,
              }),
            },
            onError: {
              target: "idle",
              actions: assign({
                isLoadingAvailableTurns: false,
                availableError: ({ event }) => (event.error as Error)?.message || "Error loading available turns",
              }),
            },
          },
        },
        loadingMyTurns: {
          entry: assign({
            isLoadingMyTurns: true,
            myTurnsError: null,
          }),
          invoke: {
            src: fromPromise(async ({ input }: { input: { accessToken: string; status?: string } }) => {
              return await TurnService.getMyTurns(input.accessToken, input.status);
            }),
            input: ({ context, event }) => ({
              accessToken: context.accessToken!,
              status: (event as any).status
            }),
            onDone: {
              target: "idle",
              actions: assign({
                myTurns: ({ event }) => event.output,
                isLoadingMyTurns: false,
                myTurnsError: null,
              }),
            },
            onError: {
              target: "idle",
              actions: assign({
                isLoadingMyTurns: false,
                myTurnsError: ({ event }) => (event.error as Error)?.message || "Error loading my turns",
              }),
            },
          },
        },
        reservingTurn: {
          entry: assign({
            isReservingTurn: true,
            reserveError: null,
          }),
          invoke: {
            src: fromPromise(async ({ input }: { input: { accessToken: string; userId: string; turnId: string } }) => {
              return await TurnService.reserveTurn(
                { turnId: input.turnId, patientId: input.userId },
                input.accessToken
              );
            }),
            input: ({ context, event }) => ({
              accessToken: context.accessToken!,
              userId: context.userId!,
              turnId: (event as any).turnId
            }),
            onDone: {
              target: "idle",
              actions: assign({
                isReservingTurn: false,
                reserveError: null,
              }),
            },
            onError: {
              target: "idle",
              actions: assign({
                isReservingTurn: false,
                reserveError: ({ event }) => (event.error as Error)?.message || "Error reserving turn",
              }),
            },
          },
        },
        creatingTurn: {
          entry: assign({
            isCreatingTurn: true,
            error: null,
          }),
          invoke: {
            src: fromPromise(async ({ input }: { input: { accessToken: string; userId: string; doctorId: string; scheduledAt: string } }) => {
              return await TurnService.createTurn(
                {
                  doctorId: input.doctorId,
                  patientId: input.userId,
                  scheduledAt: input.scheduledAt,
                },
                input.accessToken
              );
            }),
            input: ({ context }) => {
              const inputData = {
                accessToken: context.accessToken!,
                userId: context.userId!,
                doctorId: context.takeTurn.doctorId,
                scheduledAt: context.takeTurn.scheduledAt!
              };
              return inputData;
            },
            onDone: {
              target: "idle",
              actions: assign({
                isCreatingTurn: false,
                error: null,
              }),
            },
            onError: {
              target: "idle",
              actions: assign({
                isCreatingTurn: false,
                error: ({ event }) => (event.error as Error)?.message || "Error creating turn",
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
        error: null
      }),
      
      invoke: {
        src: fromPromise(async ({ input }: { input: { accessToken: string; userId: string } }) => {
          const response = await DoctorService.getAvailability(input.accessToken, input.userId);
          return response;
        }),

        input: ({ context }) => ({
          accessToken: context.accessToken!,
          userId: context.userId!
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
              
              console.log('No API data found, using default availability');
              return context.availability;
            },
            error: () => null,
            isLoadingAvailability: false
          })
        },
        onError: { 
          target: "idle",
          actions: assign({
            error: () => null, 
            isLoadingAvailability: false
          })
        },
      },
    },
    saving: {
      entry: assign({
        isSavingAvailability: true,
        error: null
      }),
      
      invoke: {
        src: fromPromise(async ({ input }: { input: { accessToken: string; userId: string; availability: DayAvailability[] } }) => {
          const dayMapping: { [key: string]: string } = {
            "LUNES": "MONDAY",
            "MARTES": "TUESDAY", 
            "MIÉRCOLES": "WEDNESDAY",
            "MIERCOLES": "WEDNESDAY",
            "JUEVES": "THURSDAY",
            "VIERNES": "FRIDAY",
            "SÁBADO": "SATURDAY",
            "SABADO": "SATURDAY",
            "DOMINGO": "SUNDAY"
          };

          const availabilityRequest: DoctorAvailabilityRequest = {
            slotDurationMin: 30, 
            weeklyAvailability: input.availability.map((day: DayAvailability) => {
              const spanishDay = day.day.toUpperCase();
              const englishDay = dayMapping[spanishDay] || spanishDay;
              
              console.log(`Mapping day: ${day.day} -> ${spanishDay} -> ${englishDay}`);
              
              return {
                day: englishDay,
                enabled: day.enabled,
                ranges: (day.ranges || []).filter(range => {
                  if (!range.start || !range.end) return false;
                  
                  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
                  const isValidStart = timeRegex.test(range.start);
                  const isValidEnd = timeRegex.test(range.end);
                  
                  if (!isValidStart || !isValidEnd) {
                    console.warn(`Invalid time format: start=${range.start}, end=${range.end}`);
                    return false;
                  }
                  
                  return true;
                })
              };
            })
          };

          console.log('Sending availability request:', JSON.stringify(availabilityRequest, null, 2));
          await DoctorService.saveAvailability(input.accessToken, input.userId, availabilityRequest);
          return "Availability saved successfully";
        }),

        input: ({ context }) => ({
          accessToken: context.accessToken!,
          userId: context.userId!,
          availability: context.availability
        }),

        onDone: { 
          target: "idle",
          actions: assign({
            error: () => null,
            isSavingAvailability: false
          })
        },
        onError: { 
          target: "idle",
          actions: assign({
            error: ({ event }) => {
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
});