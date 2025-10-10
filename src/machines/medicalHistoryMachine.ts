import { createMachine, assign, fromPromise } from 'xstate';
import { MedicalHistory, CreateMedicalHistoryRequest, UpdateMedicalHistoryContentRequest } from '../models/MedicalHistory';
import { MedicalHistoryService } from '../service/medical-history-service.service';
import { TurnService } from '../service/turn-service.service';
import { orchestrator } from '../core/Orchestrator';

export const MEDICAL_HISTORY_MACHINE_ID = "medicalHistory"; 
export const MEDICAL_HISTORY_MACHINE_EVENT_TYPES = [
  "LOAD_PATIENT_MEDICAL_HISTORY",
  "ADD_HISTORY_ENTRY_FOR_TURN",
  "UPDATE_HISTORY_ENTRY",
  "DELETE_HISTORY_ENTRY",
  "SELECT_HISTORY",
  "CLEAR_SELECTION",
  "SET_NEW_CONTENT",
  "SET_EDIT_CONTENT",
  "CLEAR_ERROR",
]; 
interface MedicalHistoryMachineContext {
  medicalHistories: MedicalHistory[];
  currentPatientId: string | null;
  currentTurnId: string | null;
  currentTurnInfo: {
    patientName?: string;
    scheduledAt?: string;
    status?: string;
  } | null;
  patientTurns: any[]; // Store patient's turns for turn information display
  error: string | null;
  isLoading: boolean;
  selectedHistory: MedicalHistory | null;
  newHistoryContent: string;
  editingContent: string;
  accessToken: string | null;
  doctorId: string | null;
}

export type MedicalHistoryMachineEvent =
  | { type: 'LOAD_PATIENT_MEDICAL_HISTORY'; patientId: string; accessToken: string }
  | { type: 'ADD_HISTORY_ENTRY_FOR_TURN'; turnId: string; content: string; accessToken: string; doctorId: string; turnInfo?: { patientName?: string; scheduledAt?: string; status?: string } }
  | { type: 'UPDATE_HISTORY_ENTRY'; historyId: string; content: string; accessToken: string; doctorId: string }
  | { type: 'DELETE_HISTORY_ENTRY'; historyId: string; accessToken: string; doctorId: string }
  | { type: 'SELECT_HISTORY'; history: MedicalHistory }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_NEW_CONTENT'; content: string }
    | { type: 'SET_EDIT_CONTENT'; content: string }
  | { type: 'CLEAR_ERROR' };

export const medicalHistoryMachine = createMachine({
  id: 'medicalHistory',
  types: {} as {
    context: MedicalHistoryMachineContext;
    events: MedicalHistoryMachineEvent;
  },
  initial: 'idle',
  context: {
    medicalHistories: [],
    currentPatientId: null,
    currentTurnId: null,
    currentTurnInfo: null,
    patientTurns: [],
    error: null,
    isLoading: false,
    selectedHistory: null,
    newHistoryContent: '',
    editingContent: '',
    accessToken: null,
    doctorId: null,
  } as MedicalHistoryMachineContext,
  states: {
    idle: {
      on: {
        LOAD_PATIENT_MEDICAL_HISTORY: {
          target: 'loadingMedicalHistory',
          actions: assign({
            currentPatientId: ({ event }) => event.patientId,
            accessToken: ({ event }) => event.accessToken,
            error: () => null,
          }),
        },
        ADD_HISTORY_ENTRY_FOR_TURN: {
          target: 'addingMedicalHistoryForTurn',
          actions: assign({
            currentTurnId: ({ event }) => event.turnId,
            currentTurnInfo: ({ event }) => event.turnInfo || null,
            newHistoryContent: ({ event }) => event.content,
            accessToken: ({ event }) => event.accessToken,
            doctorId: ({ event }) => event.doctorId,
            error: () => null,
          }),
        },
        UPDATE_HISTORY_ENTRY: {
          target: 'updatingMedicalHistory',
          actions: assign({
            editingContent: ({ event }) => event.content,
            accessToken: ({ event }) => event.accessToken,
            doctorId: ({ event }) => event.doctorId,
            selectedHistory: ({ context, event }) => 
              context.medicalHistories.find(h => h.id === event.historyId) || null,
            error: () => null,
          }),
        },
        DELETE_HISTORY_ENTRY: {
          target: 'deletingMedicalHistory',
          actions: assign({
            accessToken: ({ event }) => event.accessToken,
            doctorId: ({ event }) => event.doctorId,
            selectedHistory: ({ context, event }) => 
              context.medicalHistories.find(h => h.id === event.historyId) || null,
            error: () => null,
          }),
        },
        SELECT_HISTORY: {
          actions: assign({
            selectedHistory: ({ event }) => event.history,
            newHistoryContent: ({ event }) => event.history.content || '',
          }),
        },
        CLEAR_SELECTION: {
          actions: assign({
            selectedHistory: () => null,
            editingContent: () => '',
          }),
        },
        SET_NEW_CONTENT: {
          actions: assign({
            newHistoryContent: ({ event }) => event.content,
          }),
        },
        SET_EDIT_CONTENT: {
          actions: assign({
            editingContent: ({ event }) => event.content,
          }),
        },
        CLEAR_ERROR: {
          actions: assign({
            error: () => null,
          }),
        },
      },
    },
    loadingMedicalHistory: {
      entry: assign({ isLoading: () => true }),
      exit: assign({ isLoading: () => false }),
      invoke: {
        src: 'loadPatientMedicalHistory',
        input: ({ context }) => ({ 
          patientId: context.currentPatientId!,
          accessToken: context.accessToken!,
        }),
        onDone: {
          target: 'idle',
          actions: assign({
            medicalHistories: ({ event }) => event.output.medicalHistories,
            patientTurns: ({ event }) => event.output.patientTurns,
          }),
        },
        onError: {
          target: 'idle',
          actions: assign({
            error: ({ event }) => `Error loading medical history: ${event.error}`,
          }),
        },
      },
    },
    // Deprecated state removed
    addingMedicalHistoryForTurn: {
      entry: assign({ isLoading: () => true }),
      exit: assign({ isLoading: () => false }),
      invoke: {
        src: 'addMedicalHistoryEntryForTurn',
        input: ({ context }) => ({
          turnId: context.currentTurnId!,
          content: context.newHistoryContent,
          accessToken: context.accessToken!,
          doctorId: context.doctorId!,
        }),
        onDone: {
          target: 'idle',
          actions: [
            assign({
              medicalHistories: ({ context, event }) => [...context.medicalHistories, event.output],
              newHistoryContent: () => '',
              currentTurnId: () => null,
              currentTurnInfo: () => null,
            }),
            ({ context }) => {
              const turnInfo = context.currentTurnInfo;
              const message = turnInfo 
                ? `Historia médica agregada exitosamente para ${turnInfo.patientName} - ${new Date(turnInfo.scheduledAt || '').toLocaleDateString()}`
                : 'Historia médica agregada exitosamente';
              
              orchestrator.send({
                type: 'OPEN_SNACKBAR',
                message,
                severity: 'success'
              });
            }
          ],
        },
        onError: {
          target: 'idle',
          actions: [
            assign({
              error: ({ event }) => `Error adding medical history entry for turn: ${event.error}`,
              currentTurnId: () => null,
              currentTurnInfo: () => null,
            }),
            ({ context }) => {
              const turnInfo = context.currentTurnInfo;
              const message = turnInfo 
                ? `Error al agregar historia médica para ${turnInfo.patientName}`
                : 'Error al agregar historia médica';
              
              orchestrator.send({
                type: 'OPEN_SNACKBAR',
                message,
                severity: 'error'
              });
            }
          ],
        },
      },
    },
    updatingMedicalHistory: {
      entry: assign({ isLoading: () => true }),
      exit: assign({ isLoading: () => false }),
      invoke: {
        src: 'updateMedicalHistoryEntry',
        input: ({ context }) => ({
          historyId: context.selectedHistory!.id,
          content: context.editingContent,
          accessToken: context.accessToken!,
          doctorId: context.doctorId!,
        }),
        onDone: {
          target: 'idle',
          actions: [
            assign({
              medicalHistories: ({ context, event }) =>
                context.medicalHistories.map(h =>
                  h.id === event.output.id ? event.output : h
                ),
              selectedHistory: ({ event }) => event.output,
            }),
            () => {
              orchestrator.send({
                type: 'OPEN_SNACKBAR',
                message: 'Historia médica actualizada exitosamente',
                severity: 'success'
              });
            }
          ],
        },
        onError: {
          target: 'idle',
          actions: [
            assign({
              error: ({ event }) => `Error updating medical history entry: ${event.error}`,
            }),
            () => {
              orchestrator.send({
                type: 'OPEN_SNACKBAR',
                message: 'Error al actualizar historia médica',
                severity: 'error'
              });
            }
          ],
        },
      },
    },
    deletingMedicalHistory: {
      entry: assign({ isLoading: () => true }),
      exit: assign({ isLoading: () => false }),
      invoke: {
        src: 'deleteMedicalHistoryEntry',
        input: ({ context }) => ({ 
          historyId: context.selectedHistory!.id,
          accessToken: context.accessToken!,
          doctorId: context.doctorId!,
        }),
        onDone: {
          target: 'idle',
          actions: [
            assign({
              medicalHistories: ({ context }) =>
                context.medicalHistories.filter(h => h.id !== context.selectedHistory!.id),
              selectedHistory: () => null,
            }),
            () => {
              orchestrator.send({
                type: 'OPEN_SNACKBAR',
                message: 'Historia médica eliminada exitosamente',
                severity: 'success'
              });
            }
          ],
        },
        onError: {
          target: 'idle',
          actions: [
            assign({
              error: ({ event }) => `Error deleting medical history entry: ${event.error}`,
            }),
            () => {
              orchestrator.send({
                type: 'OPEN_SNACKBAR',
                message: 'Error al eliminar historia médica',
                severity: 'error'
              });
            }
          ],
        },
      },
    },
  },
}, {
  actors: {
    loadPatientMedicalHistory: fromPromise(async ({ input }: { input: { patientId: string; accessToken: string } }) => {
      try {
        // Load both medical history and patient turns in parallel
        const [medicalHistories, patientTurns] = await Promise.all([
          MedicalHistoryService.getPatientMedicalHistory(input.accessToken, input.patientId),
          TurnService.getPatientTurns(input.patientId, input.accessToken).catch(() => []) // Don't fail if turns can't be loaded
        ]);
        
        return {
          medicalHistories,
          patientTurns
        };
      } catch (error) {
        // If medical history fails, still try to return what we can
        const medicalHistories = await MedicalHistoryService.getPatientMedicalHistory(input.accessToken, input.patientId);
        return {
          medicalHistories,
          patientTurns: []
        };
      }
    }),
    addMedicalHistoryEntryForTurn: fromPromise(async ({ input }: { input: { turnId: string; content: string; accessToken: string; doctorId: string } }) => {
      const request: CreateMedicalHistoryRequest = {
        turnId: input.turnId,
        content: input.content,
      };
      return await MedicalHistoryService.addMedicalHistory(input.accessToken, input.doctorId, request);
    }),
    updateMedicalHistoryEntry: fromPromise(async ({ input }: { input: { historyId: string; content: string; accessToken: string; doctorId: string } }) => {
      const request: UpdateMedicalHistoryContentRequest = {
        content: input.content,
      };
      return await MedicalHistoryService.updateMedicalHistory(input.accessToken, input.doctorId, input.historyId, request);
    }),
    deleteMedicalHistoryEntry: fromPromise(async ({ input }: { input: { historyId: string; accessToken: string; doctorId: string } }) => {
      await MedicalHistoryService.deleteMedicalHistory(input.accessToken, input.doctorId, input.historyId);
      return input.historyId;
    }),
  },
});