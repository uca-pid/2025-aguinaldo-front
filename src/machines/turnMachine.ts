import { createMachine, assign, fromPromise } from "xstate";
import dayjs, { Dayjs } from "dayjs";
import { createTurn, cancelTurn } from "../utils/MachineUtils/turnMachineUtils";
import { orchestrator } from "#/core/Orchestrator";
import type { Doctor, TurnResponse } from "../models/Turn";
import { DATA_MACHINE_ID } from "./dataMachine";
import { UI_MACHINE_ID } from "./uiMachine";
import { TurnService } from '../service/turn-service.service';
import { TurnModifyCreateRequest, TurnModifyService } from "#/service/turn-modify-service.service";

export const TURN_MACHINE_ID = "turn";
export const TURN_MACHINE_EVENT_TYPES = [
  "UPDATE_FORM",
  "NEXT",
  "BACK",
  "RESET_TAKE_TURN",
  "RESET_SHOW_TURNS",
  "DATA_LOADED",
  "RESERVE_TURN",
  "CREATE_TURN",
  "CANCEL_TURN",
  "CLEAR_CANCEL_SUCCESS",
  "SUBMIT_MODIFY_REQUEST",
  "LOAD_MODIFY_AVAILABLE_SLOTS",
  "NAVIGATE",
];

export interface TurnMachineContext {
  doctors: Doctor[];
  availableTurns: string[];
  availableDates: string[];
  myTurns: TurnResponse[];
  isCreatingTurn: boolean;
  isReservingTurn: boolean;
  isCancellingTurn: boolean;
  cancellingTurnId: string | null;
  error: string | null;
  reserveError: string | null;
  cancelSuccess: string | null;

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

  modifyTurn?: {
    turnId?: string | null;
    currentTurn?: TurnResponse | null;
    selectedDate?: Dayjs | null;
    selectedTime?: string | null;
    availableSlots?: string[];
    availableDates?: string[];
    reason?: string;
  };

  modifyError: string | null;
  accessToken: string | null;
  userId: string | null;
  specialties: { value: string; label: string }[];
  isLoadingAvailableDates: boolean;
  isLoadingAvailableSlots: boolean;
}

export type TurnMachineEvent =
  | { type: "UPDATE_FORM"; path: string[]; value: any }
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "RESET_TAKE_TURN" }
  | { type: "RESET_SHOW_TURNS" }
  | { type: "DATA_LOADED" }
  | { type: "RESERVE_TURN"; turnId: string }
  | { type: "CREATE_TURN" }
  | { type: "CANCEL_TURN"; turnId: string }
  | { type: "CLEAR_CANCEL_SUCCESS" }
  | { type: "SUBMIT_MODIFY_REQUEST" }
  | { type: "LOAD_MODIFY_AVAILABLE_SLOTS"; doctorId: string; date: string }
  | { type: "RESET_MODIFY_TURN" }
  | { type: "NAVIGATE"; to: string | null };

export const turnMachine = createMachine({
  id: "turnMachine",
  type: "parallel", 
  context: {
    doctors: [],
    availableTurns: [],
    myTurns: [],
    
    isCreatingTurn: false,
    isReservingTurn: false,
    isCancellingTurn: false,
    cancellingTurnId: null,
    
    isModifyingTurn: false,
    isLoadingTurnDetails: false,
    isLoadingAvailableSlots: false,
    
    error: null,
    reserveError: null,
    cancelSuccess: null,
    modifyError: null,
    
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
    modifyTurn: {
      turnId: null,
      currentTurn: null,
      selectedDate: null,
      selectedTime: null,
      availableSlots: [],
      availableDates: [],
      reason: "",
    },
    
    accessToken: null,
    userId: null,
    specialties: [],
    availableDates: [],
    isLoadingAvailableDates: false,
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
                availableDates: [],
                isLoadingAvailableDates: false,
              }),
            },
          },
        },
        step2: {
          entry: assign({ isLoadingAvailableDates: true }),
          invoke: {
            src: fromPromise(async ({ input }) => {
              return await TurnService.getAvailableDates(input.doctorId, input.accessToken);
            }),
            input: ({ context }) => ({
              doctorId: context.takeTurn.doctorId,
              accessToken: context.accessToken,
            }),
            onDone: {
              actions: assign({
                availableDates: ({ event }) => event.output,
                isLoadingAvailableDates: false,
              }),
            },
            onError: {
              actions: assign({
                isLoadingAvailableDates: false,
                error: 'Failed to load available dates',
              }),
            },
          },
          on: {
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
                availableDates: [],
                isLoadingAvailableDates: false,
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
    modifyTurn: {
      initial: "idle",
      states: {
        idle: {
          always: {
            guard: ({ context }) => !!context.modifyTurn?.turnId,
            target: "modifying"
          },
          on: {
            NAVIGATE: {
              actions: assign({
                modifyTurn: ({ context, event }) => {
                  if (event.to?.includes('/patient/modify-turn')) {
                    const url = new URL(window.location.href);
                    const turnId = url.searchParams.get('turnId');
                    const currentTurn = context.myTurns.find(turn => turn.id === turnId) || null;
                    const scheduledAt = currentTurn ? dayjs(currentTurn.scheduledAt) : null;
                    return {
                      turnId,
                      currentTurn,
                      selectedDate: scheduledAt,
                      selectedTime: currentTurn?.scheduledAt || null,
                      availableSlots: [],
                      availableDates: [],
                      reason: "",
                    };
                  }
                  return {
                    turnId: null,
                    currentTurn: null,
                    selectedDate: null,
                    selectedTime: null,
                    availableSlots: [],
                    availableDates: [],
                    reason: "",
                  };
                }
              }),
            },
          },
        },
        modifying: {
          entry: [
            assign({ isLoadingAvailableDates: true }),
            ({ context }) => {
              // Si ya hay una fecha seleccionada, cargar los slots disponibles automáticamente
              if (context.modifyTurn?.selectedDate && context.modifyTurn?.currentTurn?.doctorId) {
                orchestrator.sendToMachine(DATA_MACHINE_ID, { 
                  type: "LOAD_AVAILABLE_TURNS", 
                  doctorId: context.modifyTurn.currentTurn.doctorId, 
                  date: context.modifyTurn.selectedDate.format('YYYY-MM-DD') 
                });
              }
            }
          ],
          invoke: {
            src: fromPromise(async ({ input }) => {
              if (!input.doctorId) {
                return [];
              }
              return await TurnService.getAvailableDates(input.doctorId, input.accessToken);
            }),
            input: ({ context }) => ({
              doctorId: context.modifyTurn?.currentTurn?.doctorId,
              accessToken: context.accessToken,
            }),
            onDone: {
              actions: assign({
                modifyTurn: ({ context, event }) => {
                  return {
                    ...context.modifyTurn,
                    availableDates: event.output,
                  }
                },
                isLoadingAvailableDates: false,
              }),
            },
            onError: {
              actions: assign({
                isLoadingAvailableDates: false,
                error: 'Failed to load available dates',
              }),
            },
          },
          on: {
            LOAD_MODIFY_AVAILABLE_SLOTS: {
              actions: [
                ({context}) => {
                  orchestrator.sendToMachine(DATA_MACHINE_ID, { type: "LOAD_AVAILABLE_TURNS", doctorId: context.modifyTurn?.currentTurn?.doctorId, date: context.modifyTurn?.selectedDate?.format('YYYY-MM-DD') });
                }
              ]
            },
            SUBMIT_MODIFY_REQUEST: "submittingModifyRequest",
            NAVIGATE: [
              {
                guard: ({ event }) => !!event.to?.includes('/patient/modify-turn'),
                actions: assign({
                  modifyTurn: ({ context }) => {
                    const url = new URL(window.location.href);
                    const turnId = url.searchParams.get('turnId');
                    const currentTurn = context.myTurns.find(turn => turn.id === turnId) || null;
                    const scheduledAt = currentTurn ? dayjs(currentTurn.scheduledAt) : null;
                    return {
                      turnId,
                      currentTurn,
                      selectedDate: scheduledAt,
                      selectedTime: currentTurn?.scheduledAt || null,
                      availableSlots: [],
                      availableDates: [],
                      reason: "",
                    };
                  }
                }),
                target: "idle" // Primero ir a idle para forzar reinicio completo
              },
              {
                target: "idle",
                actions: assign({
                  modifyTurn: {
                    turnId: null,
                    currentTurn: null,
                    selectedDate: null,
                    selectedTime: null,
                    availableSlots: [],
                    availableDates: [],
                    reason: "",
                  }
                }),
              }
            ],
          }
        },
        submittingModifyRequest: {
          invoke: {
            src: fromPromise(async ({ input }: { input: TurnModifyCreateRequest & { accessToken: string } }) => {
              return await TurnModifyService.createModifyRequest({
                turnId: input.turnId,
                newScheduledAt: input.newScheduledAt
              }, input.accessToken);
            }),
            input: ({ context }: any) => ({
              turnId: context.modifyTurn?.turnId!,
              newScheduledAt: (() => {
                if (!context.modifyTurn?.selectedDate || !context.modifyTurn?.selectedTime) {
                  throw new Error("Fecha y hora deben estar seleccionadas");
                }

                const timePart = context.modifyTurn.selectedTime.split('T')[1];
                const dateTimeString = `${context.modifyTurn.selectedDate.format('YYYY-MM-DD')}T${timePart}`;
                return dateTimeString;
              })(),
              accessToken: (() => {
                try {
                  const dataSnapshot = orchestrator.getSnapshot(DATA_MACHINE_ID);
                  return dataSnapshot?.context?.accessToken || null;
                } catch {
                  return null;
                }
              })(),
            }),
            onDone: {
              target: "idle",
              actions: [
                assign({
                  modifyError: null,
                }),
                () => {
                  // Cargar solo myTurns - myModifyRequests se cargará automáticamente después
                  orchestrator.sendToMachine(DATA_MACHINE_ID, { type: "LOAD_MY_TURNS" });
                  
                  // Mostrar mensaje de éxito
                  orchestrator.sendToMachine(UI_MACHINE_ID, {
                    type: "OPEN_SNACKBAR",
                    message: "Solicitud de modificación enviada exitosamente",
                    severity: "success"
                  });
                  
                  // Navegar inmediatamente - los datos se cargarán secuencialmente
                  orchestrator.sendToMachine(UI_MACHINE_ID, { type: "NAVIGATE", to: "/patient/view-turns" });
                }
              ]
            },
            onError: {
              target: "idle",
              actions: [
                assign({
                  modifyError: ({ event }: any) => (event.error as Error)?.message || "Error enviando solicitud de modificación"
                }),
                () => {
                  orchestrator.sendToMachine(UI_MACHINE_ID, {
                    type: "OPEN_SNACKBAR",
                    message: "Error enviando solicitud de modificación",
                    severity: "error"
                  });
                }
              ]
            }
          }
        },
      },
    },
    dataManagement: {
      initial: "idle",
      states: {
        idle: {
          on: {
            DATA_LOADED: {
              actions: assign(() => {
                try {
                  const dataSnapshot = orchestrator.getSnapshot(DATA_MACHINE_ID);
                  const dataContext = dataSnapshot.context
                  
                  const authSnapshot = orchestrator.getSnapshot('auth');
                  const authContext = authSnapshot?.context;
                  
                  const doctors = dataContext.doctors || [];
                  
                  const specialties = Array.from(new Set(doctors.map((doctor: any) => doctor.specialty))).map((specialty: unknown) => ({
                    value: specialty as string,
                    label: (specialty as string).charAt(0).toUpperCase() + (specialty as string).slice(1)
                  }));
                  
                  return {
                    doctors,
                    availableTurns: dataContext.availableTurns || [],
                    myTurns: dataContext.myTurns || [],
                    accessToken: dataContext.accessToken || null,
                    userId: dataContext.userId || authContext?.authResponse?.id || null,
                    specialties,
                  };
                } catch (error) {
                  return {};
                }
              }),
            },
            CREATE_TURN: {
              target: "creatingTurn",
            }
          },
        },
        creatingTurn: {
          entry: assign({
            isCreatingTurn: true,
            error: null,
          }),
          invoke: {
            src: fromPromise(async ({ input }: { input: { accessToken: string; userId: string; doctorId: string; scheduledAt: string } }) => {
              return await createTurn(input);
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
              actions: [
                assign({
                  isCreatingTurn: false,
                  error: null,
                }),
                () => {
                  orchestrator.sendToMachine(DATA_MACHINE_ID, { type: "LOAD_MY_TURNS" });
                  orchestrator.sendToMachine(UI_MACHINE_ID, { 
                    type: "OPEN_SNACKBAR", 
                    message: "Turno creado exitosamente", 
                    severity: "success" 
                  });
                }
              ],
            },
            onError: {
              target: "idle",
              actions: [
                assign({
                  isCreatingTurn: false,
                  error: ({ event }) => (event.error as Error)?.message || "Error creating turn",
                }),
                ({ event }) => {
                  const errorMessage = (event.error as Error)?.message || "Error al crear el turno";
                  orchestrator.sendToMachine(UI_MACHINE_ID, { 
                    type: "OPEN_SNACKBAR", 
                    message: errorMessage, 
                    severity: "error" 
                  });
                }
              ],
            },
          },
        },
        cancellingTurn: {
          entry: assign({
            isCancellingTurn: true,
          }),
          invoke: {
            src: fromPromise(async ({ input }: { input: { accessToken: string; turnId: string } }) => {
              return await cancelTurn(input);
            }),
            input: ({ context }) => ({
              accessToken: context.accessToken!,
              turnId: context.cancellingTurnId!
            }),
            onDone: {
              target: "idle",
              actions: [
                assign({
                  isCancellingTurn: false,
                  cancellingTurnId: null,
                  cancelSuccess: "Turno cancelado exitosamente",
                }),
                () => {
                  orchestrator.sendToMachine(DATA_MACHINE_ID, { type: "LOAD_MY_TURNS" });
                  orchestrator.sendToMachine(UI_MACHINE_ID, { 
                    type: "OPEN_SNACKBAR", 
                    message: "Turno cancelado exitosamente", 
                    severity: "success" 
                  });
                }
              ],
            },
            onError: {
              target: "idle",
              actions: [
                assign({
                  isCancellingTurn: false,
                  cancellingTurnId: null,
                  error: ({ event }) => (event.error as Error)?.message || "Error al cancelar el turno",
                }),
                ({ event }) => {
                  const errorMessage = (event.error as Error)?.message || "Error al cancelar el turno";
                  orchestrator.sendToMachine(UI_MACHINE_ID, { 
                    type: "OPEN_SNACKBAR", 
                    message: errorMessage, 
                    severity: "error" 
                  });
                }
              ],
            },
          },
        },
      },
    },
  },
  
  on: {
    CANCEL_TURN: {
      target: ".dataManagement.cancellingTurn",
      actions: assign({
        cancellingTurnId: ({ event }) => event.turnId,
      }),
    },
    CLEAR_CANCEL_SUCCESS: {
      actions: assign({
        cancelSuccess: null,
      }),
    },
    UPDATE_FORM: {
      actions: assign(({ context, event }) => {
        if (event.type !== "UPDATE_FORM" || !event.path || event.path.length === 0) {
          return {};
        }
        const newContext = { ...context } as any;
        let current = newContext;
        for (let i = 0; i < event.path.length - 1; i++) {
          const key = event.path[i];
          current[key] = { ...current[key] };
          current = current[key];
        }
        current[event.path[event.path.length - 1]] = event.value;
        return newContext;
      }),
    }
  },
});