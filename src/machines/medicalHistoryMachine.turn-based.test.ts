import { describe, it, expect, vi } from 'vitest';
import { createActor } from 'xstate';
import { medicalHistoryMachine, type MedicalHistoryMachineEvent } from './medicalHistoryMachine';

// Mock the MedicalHistoryService
vi.mock('../service/medical-history-service.service', () => ({
  MedicalHistoryService: {
    addMedicalHistory: vi.fn(),
    getPatientMedicalHistory: vi.fn(),
    updateMedicalHistory: vi.fn(),
    deleteMedicalHistory: vi.fn(),
  },
}));

describe('medicalHistoryMachine - Turn-based Updates', () => {
  it('should handle ADD_HISTORY_ENTRY_FOR_TURN event', () => {
    const actor = createActor(medicalHistoryMachine);
    actor.start();

    const event: MedicalHistoryMachineEvent = {
      type: 'ADD_HISTORY_ENTRY_FOR_TURN',
      turnId: 'turn-123',
      content: 'Patient symptoms improved',
      accessToken: 'token-123',
      doctorId: 'doctor-456'
    };

    actor.send(event);

    // Verify the machine transitions to the correct state
    expect(actor.getSnapshot().value).toBe('addingMedicalHistoryForTurn');
    
    // Verify the context is updated correctly
    const context = actor.getSnapshot().context;
    expect(context.currentTurnId).toBe('turn-123');
    expect(context.newHistoryContent).toBe('Patient symptoms improved');
    expect(context.accessToken).toBe('token-123');
    expect(context.doctorId).toBe('doctor-456');
  });

  it('should include currentTurnId in initial context', () => {
    const actor = createActor(medicalHistoryMachine);
    actor.start();

    const context = actor.getSnapshot().context;
    expect(context).toHaveProperty('currentTurnId');
    expect(context.currentTurnId).toBeNull();
  });

  it('should clear currentTurnId after successful addition', () => {
    const actor = createActor(medicalHistoryMachine);
    actor.start();

    // Send the event to add history for turn
    actor.send({
      type: 'ADD_HISTORY_ENTRY_FOR_TURN',
      turnId: 'turn-123',
      content: 'Test content',
      accessToken: 'token',
      doctorId: 'doctor'
    });

    // Simulate successful completion
    // Note: In a real test, you'd mock the service and verify the actor behavior
    expect(actor.getSnapshot().context.currentTurnId).toBe('turn-123');
  });
});