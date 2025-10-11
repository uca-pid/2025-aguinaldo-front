import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createActor } from 'xstate';
import { medicalHistoryMachine, type MedicalHistoryMachineEvent } from './medicalHistoryMachine';

// Mock the orchestrator
vi.mock('../core/Orchestrator', () => ({
  orchestrator: {
    sendToMachine: vi.fn(),
  },
}));

// Mock the MedicalHistoryService
vi.mock('../service/medical-history-service.service', () => ({
  MedicalHistoryService: {
    addMedicalHistory: vi.fn(),
    getPatientMedicalHistory: vi.fn(),
    updateMedicalHistory: vi.fn(),
    deleteMedicalHistory: vi.fn(),
  },
}));

describe('medicalHistoryMachine - Enhanced Turn-based Updates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle ADD_HISTORY_ENTRY_FOR_TURN event with turn information', () => {
    const actor = createActor(medicalHistoryMachine);
    actor.start();

    const turnInfo = {
      patientName: 'Juan Pérez',
      scheduledAt: '2025-10-10T14:30:00Z',
      status: 'COMPLETED'
    };

    const event: MedicalHistoryMachineEvent = {
      type: 'ADD_HISTORY_ENTRY_FOR_TURN',
      turnId: 'turn-123',
      content: 'Paciente presenta mejoría en los síntomas',
      accessToken: 'token-123',
      doctorId: 'doctor-456',
      turnInfo
    };

    actor.send(event);

    // Verify the machine transitions to the correct state
    expect(actor.getSnapshot().value).toBe('addingMedicalHistoryForTurn');
    
    // Verify the context is updated correctly with turn information
    const context = actor.getSnapshot().context;
    expect(context.currentTurnId).toBe('turn-123');
    expect(context.currentTurnInfo).toEqual(turnInfo);
    expect(context.newHistoryContent).toBe('Paciente presenta mejoría en los síntomas');
    expect(context.accessToken).toBe('token-123');
    expect(context.doctorId).toBe('doctor-456');
  });

  it('should include currentTurnInfo in initial context', () => {
    const actor = createActor(medicalHistoryMachine);
    actor.start();

    const context = actor.getSnapshot().context;
    expect(context).toHaveProperty('currentTurnInfo');
    expect(context.currentTurnInfo).toBeNull();
  });

  it('should handle ADD_HISTORY_ENTRY_FOR_TURN without turn info', () => {
    const actor = createActor(medicalHistoryMachine);
    actor.start();

    const event: MedicalHistoryMachineEvent = {
      type: 'ADD_HISTORY_ENTRY_FOR_TURN',
      turnId: 'turn-456',
      content: 'Historia médica sin información adicional',
      accessToken: 'token',
      doctorId: 'doctor'
    };

    actor.send(event);

    const context = actor.getSnapshot().context;
    expect(context.currentTurnId).toBe('turn-456');
    expect(context.currentTurnInfo).toBeNull(); // Should be null when not provided
  });
});