import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createActor } from 'xstate';

// Mock dependencies BEFORE importing the machine
vi.mock('#/core/Orchestrator', () => ({
  orchestrator: {
    send: vi.fn(),
    registerMachine: vi.fn(),
  }
}));

vi.mock('../service/auth-service.service', () => ({
  AuthService: {
    saveAuthData: vi.fn(),
    refreshToken: vi.fn()
  }
}));

vi.mock('../utils/authFormValidation', () => ({
  validateField: vi.fn(),
  checkFormValidation: vi.fn()
}));

vi.mock('../utils/MachineUtils/authMachineUtils', () => ({
  checkStoredAuth: vi.fn(),
  submitAuthentication: vi.fn(),
  logoutUser: vi.fn()
}));

import { authMachine } from './authMachine';
import { orchestrator } from '#/core/Orchestrator';
import { checkStoredAuth, logoutUser } from '../utils/MachineUtils/authMachineUtils';
import { validateField, checkFormValidation } from '../utils/authFormValidation';

describe('authMachine', () => {
  let actor: any;
  let mockOrchestrator: any;
  let mockFormValidation: any;

  beforeEach(() => {
    vi.useFakeTimers(); // Enable fake timers for all tests
    // Get mocked modules
    mockOrchestrator = vi.mocked(orchestrator);
    mockFormValidation = vi.mocked({ validateField, checkFormValidation });

    // Reset mocks
    vi.clearAllMocks();

    // Setup default mocks
    vi.mocked(checkStoredAuth).mockResolvedValue({
      authData: null,
      isAuthenticated: false
    });
    mockFormValidation.validateField.mockReturnValue('');
    mockFormValidation.checkFormValidation.mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    if (actor) {
      actor.stop();
    }
  });

  describe('initial state', () => {
    it('should start in checkingAuth state and transition to idle when not authenticated', async () => {
      actor = createActor(authMachine);
      actor.start();

      // Should start in checkingAuth state
      expect(actor.getSnapshot().value).toBe('checkingAuth');

      // Wait for async transition to complete
      await vi.waitFor(() => {
        expect(actor.getSnapshot().value).toBe('idle');
      });
    });

    it('should check stored auth on initialization', async () => {
      vi.mocked(checkStoredAuth).mockResolvedValue({
        authData: { accessToken: 'token123', id: '1', role: 'PATIENT' },
        isAuthenticated: true
      });

      actor = createActor(authMachine);
      actor.start();

      await vi.waitFor(() => {
        expect(vi.mocked(checkStoredAuth)).toHaveBeenCalled();
        expect(actor.getSnapshot().context.isAuthenticated).toBe(true);
      });
    });
  });

  describe('checkingAuth state', () => {
    it('should transition to authenticated when user is authenticated', async () => {
      vi.mocked(checkStoredAuth).mockResolvedValue({
        authData: { accessToken: 'token123', id: '1', role: 'PATIENT', status: 'ACTIVE' },
        isAuthenticated: true
      });

      actor = createActor(authMachine);
      actor.start();

      await vi.waitFor(() => {
        expect(actor.getSnapshot().value).toBe('authenticated');
        expect(actor.getSnapshot().context.isAuthenticated).toBe(true);
      });
    });

    it('should transition to idle when user is not authenticated', async () => {
      actor = createActor(authMachine);
      actor.start();

      await vi.waitFor(() => {
        expect(actor.getSnapshot().value).toBe('idle');
        expect(actor.getSnapshot().context.isAuthenticated).toBe(false);
      });
    });

    it('should navigate to pending activation for inactive users', async () => {
      vi.mocked(checkStoredAuth).mockResolvedValue({
        authData: { accessToken: 'token123', id: '1', role: 'PATIENT', status: 'PENDING' },
        isAuthenticated: true
      });

      actor = createActor(authMachine);
      actor.start();

      await vi.waitFor(() => {
        expect(actor.getSnapshot().value).toBe('authenticated');
      });

      // Wait for the setTimeout to execute
      vi.runAllTimers();

      expect(mockOrchestrator.send).toHaveBeenCalledWith({
        type: 'NAVIGATE',
        to: '/pending-activation'
      });
    });

    it('should set auth data for active users', async () => {
      vi.mocked(checkStoredAuth).mockResolvedValue({
        authData: { accessToken: 'token123', id: '1', role: 'PATIENT', status: 'ACTIVE' },
        isAuthenticated: true
      });

      actor = createActor(authMachine);
      actor.start();

      await vi.waitFor(() => {
        expect(actor.getSnapshot().value).toBe('authenticated');
      });

      vi.runAllTimers();

      expect(mockOrchestrator.send).toHaveBeenCalledWith({
        type: 'SET_AUTH',
        accessToken: 'token123',
        userId: '1',
        userRole: 'PATIENT'
      });
    });
  });

  describe('authenticated state', () => {
    beforeEach(async () => {
      vi.mocked(checkStoredAuth).mockResolvedValue({
        authData: { accessToken: 'token123', id: '1', role: 'PATIENT', status: 'ACTIVE' },
        isAuthenticated: true
      });

      actor = createActor(authMachine);
      actor.start();
      
      await vi.waitFor(() => {
        expect(actor.getSnapshot().value).toBe('authenticated');
      });
    });

    it('should handle LOGOUT event', () => {
      actor.send({ type: 'LOGOUT' });

      expect(actor.getSnapshot().value).toBe('loggingOut');
    });

    it('should handle HANDLE_AUTH_ERROR event', () => {
      actor.send({ type: 'HANDLE_AUTH_ERROR', error: new Error('Token expired') });

      expect(actor.getSnapshot().value).toBe('refreshingToken');
    });
  });

  describe('loggingOut state', () => {
    beforeEach(async () => {
      vi.mocked(checkStoredAuth).mockResolvedValue({
        authData: { accessToken: 'token123', id: '1', role: 'PATIENT', status: 'ACTIVE' },
        isAuthenticated: true
      });

      actor = createActor(authMachine);
      actor.start();
      
      await vi.waitFor(() => {
        expect(actor.getSnapshot().value).toBe('authenticated');
      });
      
      actor.send({ type: 'LOGOUT' });
    });

    it('should call logoutUser and transition to idle on success', async () => {
      vi.mocked(logoutUser).mockResolvedValue(true);

      // Wait for the promise to resolve
      await vi.waitFor(() => {
        expect(actor.getSnapshot().value).toBe('idle');
      });

      expect(vi.mocked(logoutUser)).toHaveBeenCalled();
      expect(actor.getSnapshot().context.isAuthenticated).toBe(false);
      expect(actor.getSnapshot().context.authResponse).toBe(null);
      expect(mockOrchestrator.send).toHaveBeenCalledWith({ type: 'NAVIGATE', to: '/' });
    });

    it('should transition to idle on logout error', async () => {
      vi.mocked(logoutUser).mockRejectedValue(new Error('Logout failed'));

      await vi.waitFor(() => {
        expect(actor.getSnapshot().value).toBe('idle');
      });

      expect(actor.getSnapshot().context.isAuthenticated).toBe(false);
      expect(mockOrchestrator.send).toHaveBeenCalledWith({ type: 'NAVIGATE', to: '/' });
    });
  });

  describe('idle state', () => {
    beforeEach(() => {
      actor = createActor(authMachine);
      actor.start();
    });

    it('should handle UPDATE_FORM event', () => {
      mockFormValidation.validateField.mockReturnValue('Invalid email');
      mockFormValidation.checkFormValidation.mockReturnValue(false);

      actor.send({ type: 'UPDATE_FORM', key: 'email', value: 'invalid-email' });

      expect(actor.getSnapshot().context.formValues.email).toBe('invalid-email');
      expect(actor.getSnapshot().context.formErrors?.email).toBe('Invalid email');
      expect(actor.getSnapshot().context.hasErrorsOrEmpty).toBe(false);
    });

    it('should handle TOGGLE_USER_TYPE event', () => {
      mockFormValidation.checkFormValidation.mockReturnValue(false);

      actor.send({ type: 'TOGGLE_USER_TYPE', isPatient: false });

      expect(actor.getSnapshot().context.isPatient).toBe(false);
      expect(actor.getSnapshot().context.hasErrorsOrEmpty).toBe(false);
    });

    it('should handle TOGGLE_MODE event', () => {
      actor.send({ type: 'TOGGLE_MODE', mode: 'register' });

      expect(actor.getSnapshot().context.mode).toBe('register');
      expect(actor.getSnapshot().context.hasErrorsOrEmpty).toBe(true);
      expect(actor.getSnapshot().context.formErrors).toEqual({});
      expect(actor.getSnapshot().context.authResponse).toBe(null);
      expect(actor.getSnapshot().context.loading).toBe(false);
    });

    it('should handle SUBMIT event', () => {
      // With default mocks (validateField returns no error), SUBMIT goes to validating then immediately to submitting
      actor.send({ type: 'SUBMIT' });

      expect(actor.getSnapshot().value).toBe('submitting');
    });
  });

  describe('validating state', () => {
    beforeEach(async () => {
      actor = createActor(authMachine);
      actor.start();
      
      // Wait for initial auth check to complete
      await vi.waitFor(() => {
        expect(actor.getSnapshot().value).toBe('idle');
      });
    });

    it('should transition to submitting when form is valid', () => {
      mockFormValidation.validateField.mockReturnValue('');
      mockFormValidation.checkFormValidation.mockReturnValue(false);

      actor.send({ type: 'SUBMIT' });

      // The transition should happen automatically based on the guard
      expect(actor.getSnapshot().value).toBe('submitting');
    });

    it('should transition to idle when form is invalid', () => {
      // Add a field that will be validated (starts with "user" since isPatient is true)
      actor.send({ type: 'UPDATE_FORM', key: 'userEmail', value: 'invalid-email' });
      mockFormValidation.validateField.mockReturnValue('Invalid email format');

      // Send SUBMIT - should go to validating, then immediately to idle due to invalid form
      actor.send({ type: 'SUBMIT' });

      expect(actor.getSnapshot().value).toBe('idle');
      expect(actor.getSnapshot().context.hasErrorsOrEmpty).toBe(true);
    });
  });

  describe('submitting state', () => {
    beforeEach(async () => {
      actor = createActor(authMachine);
      actor.start();
      
      // Wait for initial auth check to complete
      await vi.waitFor(() => {
        expect(actor.getSnapshot().value).toBe('idle');
      });
      
      actor.send({ type: 'TOGGLE_MODE', mode: 'login' });
      actor.send({ type: 'SUBMIT' });
    });

    it('should set loading to true on entry', () => {
      expect(actor.getSnapshot().context.loading).toBe(true);
    });
  });

  describe('context management', () => {
    it('should initialize with default context', async () => {
      actor = createActor(authMachine);
      actor.start();

      // Wait for initial auth check to complete
      await vi.waitFor(() => {
        expect(actor.getSnapshot().value).toBe('idle');
      });

      const context = actor.getSnapshot().context;
      expect(context.mode).toBe('login');
      expect(context.isPatient).toBe(true);
      expect(context.hasErrorsOrEmpty).toBe(true);
      expect(context.isAuthenticated).toBe(false);
      expect(context.loading).toBe(false);
      expect(context.formValues.email).toBe('');
      expect(context.formErrors).toEqual({});
    });

    it('should maintain context across state transitions', async () => {
      actor = createActor(authMachine);
      actor.start();

      // Wait for initial auth check to complete
      await vi.waitFor(() => {
        expect(actor.getSnapshot().value).toBe('idle');
      });

      actor.send({ type: 'UPDATE_FORM', key: 'email', value: 'test@example.com' });
      actor.send({ type: 'TOGGLE_USER_TYPE', isPatient: false });

      expect(actor.getSnapshot().context.formValues.email).toBe('test@example.com');
      expect(actor.getSnapshot().context.isPatient).toBe(false);
    });
  });
});
