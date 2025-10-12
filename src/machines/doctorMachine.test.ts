import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createActor } from 'xstate';

// Mock dependencies BEFORE importing the machine
vi.mock('#/core/Orchestrator', () => ({
  orchestrator: {
    getSnapshot: vi.fn(),
    sendToMachine: vi.fn(),
  }
}));

vi.mock('../utils/MachineUtils/doctorMachineUtils', () => ({
  saveDoctorAvailability: vi.fn(),
  updateMedicalHistory: vi.fn(), // Legacy function - medical history now handled by medicalHistoryMachine
}));

vi.mock('./dataMachine', () => ({
  DATA_MACHINE_ID: 'dataMachine'
}));

vi.mock('./uiMachine', () => ({
  UI_MACHINE_ID: 'uiMachine'
}));

import doctorMachine from './doctorMachine';
import { orchestrator } from '#/core/Orchestrator';
import type { Patient } from '../models/Doctor';

describe('doctorMachine', () => {
  let actor: any;
  let mockOrchestrator: any;

  beforeEach(() => {
    vi.useFakeTimers();
    // Get mocked modules
    mockOrchestrator = vi.mocked(orchestrator);

    // Reset mocks
    vi.clearAllMocks();

    // Setup default mocks
    mockOrchestrator.getSnapshot.mockImplementation((machineId: string) => {
      if (machineId === 'dataMachine') {
        return {
          context: {
            doctorPatients: [],
            doctorAvailability: null
          }
        };
      }
      return { context: {} };
    });

    // Mock orchestrator methods
    mockOrchestrator.send = vi.fn();
    mockOrchestrator.sendToMachine = vi.fn();
  });

  afterEach(() => {
    if (actor) {
      actor.stop();
    }
  });

  describe('initial state', () => {
    it('should start with parallel states: patientManagement.idle and availability.idle', () => {
      actor = createActor(doctorMachine);
      actor.start();

      const state = actor.getSnapshot().value;
      expect(state).toEqual({
        patientManagement: 'idle',
        availability: 'idle'
      });
    });

    it('should initialize with default context', () => {
      actor = createActor(doctorMachine);
      actor.start();

      const context = actor.getSnapshot().context;
      expect(context.accessToken).toBe(null);
      expect(context.doctorId).toBe(null);
      expect(context.patientSearchTerm).toBe('');
      expect(context.selectedPatient).toBe(null);
      expect(context.editedHistory).toBe('');
      expect(context.isSavingHistory).toBe(false);
      expect(context.availability).toHaveLength(7);
      expect(context.isSavingAvailability).toBe(false);
      expect(context.isLoadingAvailability).toBe(false);
      expect(context.availabilityError).toBe(null);
    });
  });

  describe('global events', () => {
    beforeEach(() => {
      actor = createActor(doctorMachine);
      actor.start();
    });

    it('should handle SET_AUTH event', () => {
      actor.send({ 
        type: 'SET_AUTH', 
        accessToken: 'test-token', 
        userId: 'doctor-123',
        userRole: 'DOCTOR'
      });

      expect(actor.getSnapshot().context.accessToken).toBe('test-token');
      expect(actor.getSnapshot().context.doctorId).toBe('doctor-123');
    });

    it('should handle SET_PATIENT_SEARCH event', () => {
      actor.send({ type: 'SET_PATIENT_SEARCH', searchTerm: 'John Doe' });

      expect(actor.getSnapshot().context.patientSearchTerm).toBe('John Doe');
    });

    it('should handle DATA_LOADED event with patient data', () => {
      const mockPatients: Patient[] = [
        { id: '1', name: 'Patient', surname: '1', email: 'patient1@test.com', dni: 12345678, status: 'ACTIVE', medicalHistory: 'History 1' },
        { id: '2', name: 'Patient', surname: '2', email: 'patient2@test.com', dni: 87654321, status: 'ACTIVE', medicalHistory: 'History 2' }
      ];

      mockOrchestrator.getSnapshot.mockImplementation((machineId: string) => {
        if (machineId === 'dataMachine') {
          return {
            context: {
              doctorPatients: mockPatients,
              doctorAvailability: null
            }
          };
        }
        return { context: {} };
      });

      actor.send({ type: 'DATA_LOADED' });

      expect(actor.getSnapshot().context.patients).toEqual(mockPatients);
    });

    it('should handle DATA_LOADED event with availability data', () => {
      mockOrchestrator.getSnapshot.mockImplementation((machineId: string) => {
        if (machineId === 'dataMachine') {
          return {
            context: {
              doctorPatients: [],
              doctorAvailability: {
                weeklyAvailability: [
                  { day: 'MONDAY', enabled: true, ranges: [{ start: '09:00', end: '17:00' }] },
                  { day: 'TUESDAY', enabled: false, ranges: [{ start: '', end: '' }] }
                ]
              }
            }
          };
        }
        return { context: {} };
      });

      actor.send({ type: 'DATA_LOADED' });

      expect(actor.getSnapshot().context.availability[0]).toEqual({
        day: 'Lunes',
        enabled: true,
        ranges: [{ start: '09:00', end: '17:00' }]
      });
    });
  });

  describe('patientManagement.idle state', () => {
    beforeEach(() => {
      actor = createActor(doctorMachine);
      actor.start();
    });

    it('should handle SELECT_PATIENT event', () => {
      const patient: Patient = {
        id: '1',
        name: 'John',
        surname: 'Doe',
        email: 'john@test.com',
        dni: 12345678,
        status: 'ACTIVE',
        medicalHistory: 'Previous history'
      };

      // Mock the data machine to have the patient
      mockOrchestrator.getSnapshot.mockImplementation((machineId: string) => {
        if (machineId === 'dataMachine') {
          return {
            context: {
              doctorPatients: [patient],
              doctorAvailability: null
            }
          };
        }
        return { context: {} };
      });

      actor.send({ type: 'SELECT_PATIENT', patientId: '1' });

      // The machine should set the selectedPatientId and transition to selectingPatient
      expect(actor.getSnapshot().context.selectedPatientId).toBe('1');
      // It should then immediately find the patient and transition back to idle with selectedPatient set
      expect(actor.getSnapshot().context.selectedPatient).toEqual(patient);
      expect(actor.getSnapshot().value).toEqual({
        patientManagement: 'idle',
        availability: 'idle'
      });
    });

    it('should handle CLEAR_PATIENT_SELECTION event', () => {
      // First select a patient
      const patient: Patient = {
        id: '1',
        name: 'John',
        surname: 'Doe',
        email: 'john@test.com',
        dni: 12345678,
        status: 'ACTIVE',
        medicalHistory: 'History'
      };

      // Mock the data machine to have the patient
      mockOrchestrator.getSnapshot.mockImplementation((machineId: string) => {
        if (machineId === 'dataMachine') {
          return {
            context: {
              doctorPatients: [patient],
              doctorAvailability: null
            }
          };
        }
        return { context: {} };
      });

      actor.send({ type: 'SELECT_PATIENT', patientId: '1' });
      expect(actor.getSnapshot().context.selectedPatientId).toBe('1');
      expect(actor.getSnapshot().context.selectedPatient).toEqual(patient);

      // Then clear selection
      actor.send({ type: 'CLEAR_PATIENT_SELECTION' });

      expect(actor.getSnapshot().context.selectedPatient).toBe(null);
      expect(actor.getSnapshot().context.selectedPatientId).toBe(null);
      expect(actor.getSnapshot().context.editedHistory).toBe('');
      expect(actor.getSnapshot().context.isSavingHistory).toBe(false);
    });

    it('should handle RESET event', () => {
      // Set up some state
      const patient: Patient = {
        id: '1',
        name: 'John',
        surname: 'Doe',
        email: 'john@test.com',
        dni: 12345678,
        status: 'ACTIVE',
        medicalHistory: 'History'
      };

      // Mock the data machine to have the patient
      mockOrchestrator.getSnapshot.mockImplementation((machineId: string) => {
        if (machineId === 'dataMachine') {
          return {
            context: {
              doctorPatients: [patient],
              doctorAvailability: null
            }
          };
        }
        return { context: {} };
      });

      actor.send({ type: 'SELECT_PATIENT', patientId: '1' });
      actor.send({ type: 'START_EDIT_HISTORY' });

      // Reset
      actor.send({ type: 'RESET' });

      expect(actor.getSnapshot().context.selectedPatient).toBe(null);
      expect(actor.getSnapshot().context.selectedPatientId).toBe(null);
      expect(actor.getSnapshot().context.editedHistory).toBe('');
      expect(actor.getSnapshot().context.isSavingHistory).toBe(false);
    });

    it('should handle START_EDIT_HISTORY event', () => {
      const patient: Patient = {
        id: '1',
        name: 'John',
        surname: 'Doe',
        email: 'john@test.com',
        dni: 12345678,
        status: 'ACTIVE',
        medicalHistory: 'Existing history'
      };

      // Mock the data machine to have the patient
      mockOrchestrator.getSnapshot.mockImplementation((machineId: string) => {
        if (machineId === 'dataMachine') {
          return {
            context: {
              doctorPatients: [patient],
              doctorAvailability: null
            }
          };
        }
        return { context: {} };
      });

      // First, we need to trigger patient selection and ensure the patient is loaded
      actor.send({ type: 'SELECT_PATIENT', patientId: '1' });
      
      // Now the selectedPatient should be set, so we can start editing history
      actor.send({ type: 'START_EDIT_HISTORY' });

      expect(actor.getSnapshot().context.editedHistory).toBe('Existing history');
    });

    it('should handle UPDATE_HISTORY event', () => {
      actor.send({ type: 'UPDATE_HISTORY', value: 'New history text' });

      expect(actor.getSnapshot().context.editedHistory).toBe('New history text');
    });

    it('should transition to savingHistory on SAVE_HISTORY event', () => {
      const patient: Patient = {
        id: '1',
        name: 'John',
        surname: 'Doe',
        email: 'john@test.com',
        dni: 12345678,
        status: 'ACTIVE',
        medicalHistory: 'History'
      };

      // Mock the data machine to have the patient
      mockOrchestrator.getSnapshot.mockImplementation((machineId: string) => {
        if (machineId === 'dataMachine') {
          return {
            context: {
              doctorPatients: [patient],
              doctorAvailability: null
            }
          };
        }
        return { context: {} };
      });

      actor.send({ type: 'SET_AUTH', accessToken: 'token', userId: 'doctor-1' });
      actor.send({ type: 'SELECT_PATIENT', patientId: '1' });
      
      // Now the selectedPatient should be set, so we can save history
      actor.send({ type: 'SAVE_HISTORY' });

      expect(actor.getSnapshot().value).toEqual({
        patientManagement: 'savingHistory',
        availability: 'idle'
      });
      expect(actor.getSnapshot().context.isSavingHistory).toBe(true);
    });
  });

  describe('availability.idle state', () => {
    beforeEach(() => {
      actor = createActor(doctorMachine);
      actor.start();
    });

    it('should handle TOGGLE_DAY event', () => {
      const initialEnabled = actor.getSnapshot().context.availability[0].enabled;
      
      actor.send({ type: 'TOGGLE_DAY', index: 0 });

      expect(actor.getSnapshot().context.availability[0].enabled).toBe(!initialEnabled);
    });

    it('should handle ADD_RANGE event', () => {
      const initialRangeCount = actor.getSnapshot().context.availability[0].ranges.length;

      actor.send({ type: 'ADD_RANGE', dayIndex: 0 });

      expect(actor.getSnapshot().context.availability[0].ranges.length).toBe(initialRangeCount + 1);
      const newRange = actor.getSnapshot().context.availability[0].ranges[initialRangeCount];
      expect(newRange).toEqual({ start: '', end: '' });
    });

    it('should handle REMOVE_RANGE event', () => {
      // First add a range so we have 2
      actor.send({ type: 'ADD_RANGE', dayIndex: 0 });
      const rangeCount = actor.getSnapshot().context.availability[0].ranges.length;

      // Remove the first range
      actor.send({ type: 'REMOVE_RANGE', dayIndex: 0, rangeIndex: 0 });

      expect(actor.getSnapshot().context.availability[0].ranges.length).toBe(rangeCount - 1);
    });

    it('should handle UPDATE_RANGE event for start time', () => {
      actor.send({ 
        type: 'UPDATE_RANGE', 
        dayIndex: 0, 
        rangeIndex: 0, 
        field: 'start', 
        value: '09:00' 
      });

      expect(actor.getSnapshot().context.availability[0].ranges[0].start).toBe('09:00');
    });

    it('should handle UPDATE_RANGE event for end time', () => {
      actor.send({ 
        type: 'UPDATE_RANGE', 
        dayIndex: 0, 
        rangeIndex: 0, 
        field: 'end', 
        value: '17:00' 
      });

      expect(actor.getSnapshot().context.availability[0].ranges[0].end).toBe('17:00');
    });

    it('should transition to saving on SAVE_AVAILABILITY event', () => {
      actor.send({ type: 'SET_AUTH', accessToken: 'token', userId: 'doctor-1' });
      actor.send({ type: 'SAVE_AVAILABILITY' });

      expect(actor.getSnapshot().value).toEqual({
        patientManagement: 'idle',
        availability: 'saving'
      });
      expect(actor.getSnapshot().context.isSavingAvailability).toBe(true);
      expect(actor.getSnapshot().context.availabilityError).toBe(null);
    });
  });

  describe('patientManagement.savingHistory state', () => {
    it('should set isSavingHistory to true on entry', () => {
      const patient: Patient = {
        id: '1',
        name: 'John',
        surname: 'Doe',
        email: 'john@test.com',
        dni: 12345678,
        status: 'ACTIVE',
        medicalHistory: 'History'
      };

      // Mock the data machine to have the patient
      mockOrchestrator.getSnapshot.mockImplementation((machineId: string) => {
        if (machineId === 'dataMachine') {
          return {
            context: {
              doctorPatients: [patient],
              doctorAvailability: null
            }
          };
        }
        return { context: {} };
      });
      
      actor = createActor(doctorMachine);
      actor.start();
      actor.send({ type: 'SET_AUTH', accessToken: 'token', userId: 'doctor-1' });
      actor.send({ type: 'SELECT_PATIENT', patientId: '1' });
      
      // Now the selectedPatient should be set, so we can save history
      actor.send({ type: 'SAVE_HISTORY' });

      expect(actor.getSnapshot().context.isSavingHistory).toBe(true);
    });
  });

  describe('availability.saving state', () => {
    it('should set isSavingAvailability to true on entry', () => {
      actor = createActor(doctorMachine);
      actor.start();
      actor.send({ type: 'SET_AUTH', accessToken: 'token', userId: 'doctor-1' });
      actor.send({ type: 'SAVE_AVAILABILITY' });

      expect(actor.getSnapshot().context.isSavingAvailability).toBe(true);
      expect(actor.getSnapshot().context.availabilityError).toBe(null);
    });
  });

  describe('context management', () => {
    it('should maintain context across state transitions', () => {
      actor = createActor(doctorMachine);
      actor.start();

      const patient: Patient = {
        id: '1',
        name: 'John',
        surname: 'Doe',
        email: 'john@test.com',
        dni: 12345678,
        status: 'ACTIVE',
        medicalHistory: 'History'
      };

      // Mock the data machine to have the patient
      mockOrchestrator.getSnapshot.mockImplementation((machineId: string) => {
        if (machineId === 'dataMachine') {
          return {
            context: {
              doctorPatients: [patient],
              doctorAvailability: null
            }
          };
        }
        return { context: {} };
      });

      // Set auth
      actor.send({ type: 'SET_AUTH', accessToken: 'token', userId: 'doctor-1' });
      
      // Set patient search
      actor.send({ type: 'SET_PATIENT_SEARCH', searchTerm: 'John' });
      
      // Select a patient
      actor.send({ type: 'SELECT_PATIENT', patientId: '1' });

      // Update availability
      actor.send({ type: 'TOGGLE_DAY', index: 0 });
      actor.send({ type: 'UPDATE_RANGE', dayIndex: 0, rangeIndex: 0, field: 'start', value: '09:00' });

      // Verify all context is maintained
      expect(actor.getSnapshot().context.accessToken).toBe('token');
      expect(actor.getSnapshot().context.doctorId).toBe('doctor-1');
      expect(actor.getSnapshot().context.patientSearchTerm).toBe('John');
      expect(actor.getSnapshot().context.selectedPatient).toEqual(patient);
      expect(actor.getSnapshot().context.availability[0].enabled).toBe(true);
      expect(actor.getSnapshot().context.availability[0].ranges[0].start).toBe('09:00');
    });

    it('should handle independent parallel state transitions', () => {
      actor = createActor(doctorMachine);
      actor.start();
      actor.send({ type: 'SET_AUTH', accessToken: 'token', userId: 'doctor-1' });

      // Select a patient (patientManagement state)
      const patient: Patient = {
        id: '1',
        name: 'John',
        surname: 'Doe',
        email: 'john@test.com',
        dni: 12345678,
        status: 'ACTIVE',
        medicalHistory: 'History'
      };

      // Mock the data machine to have the patient
      mockOrchestrator.getSnapshot.mockImplementation((machineId: string) => {
        if (machineId === 'dataMachine') {
          return {
            context: {
              doctorPatients: [patient],
              doctorAvailability: null
            }
          };
        }
        return { context: {} };
      });

      actor.send({ type: 'SELECT_PATIENT', patientId: '1' });

      // Update availability (availability state)
      actor.send({ type: 'TOGGLE_DAY', index: 1 });

      // Both parallel states should maintain their context independently
      expect(actor.getSnapshot().context.selectedPatient).toEqual(patient);
      expect(actor.getSnapshot().context.availability[1].enabled).toBe(true);
      expect(actor.getSnapshot().value).toEqual({
        patientManagement: 'idle',
        availability: 'idle'
      });
    });
  });

  describe('data validation', () => {
    it('should initialize all days with default availability structure', () => {
      actor = createActor(doctorMachine);
      actor.start();

      const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
      
      actor.getSnapshot().context.availability.forEach((day: any, index: number) => {
        expect(day.day).toBe(days[index]);
        expect(day.enabled).toBe(false);
        expect(day.ranges).toHaveLength(1);
        expect(day.ranges[0]).toEqual({ start: '', end: '' });
      });
    });

    it('should preserve other days when updating a specific day', () => {
      actor = createActor(doctorMachine);
      actor.start();

      const originalDay2 = { ...actor.getSnapshot().context.availability[2] };

      actor.send({ type: 'TOGGLE_DAY', index: 0 });

      expect(actor.getSnapshot().context.availability[2]).toEqual(originalDay2);
    });
  });
});
