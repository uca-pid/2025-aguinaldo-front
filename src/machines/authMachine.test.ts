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
import { AuthService } from '../service/auth-service.service';
import { checkStoredAuth, submitAuthentication, logoutUser } from '../utils/MachineUtils/authMachineUtils';
import { validateField, checkFormValidation } from '../utils/authFormValidation';

describe('authMachine', () => {
  let actor: any;
  let mockOrchestrator: any;
  let mockAuthService: any;
  let mockAuthUtils: any;
  let mockFormValidation: any;

  beforeEach(() => {
    vi.useFakeTimers(); // Enable fake timers for all tests
    // Get mocked modules
    mockOrchestrator = vi.mocked(orchestrator);
    mockAuthService = vi.mocked(AuthService);
    mockAuthUtils = vi.mocked({ checkStoredAuth, submitAuthentication, logoutUser });
    mockFormValidation = vi.mocked({ validateField, checkFormValidation });

    // Reset mocks
    vi.clearAllMocks();

    // Setup default mocks
    mockAuthUtils.checkStoredAuth.mockReturnValue({
      authData: null,
      isAuthenticated: false
    });
    mockFormValidation.validateField.mockReturnValue('');
    mockFormValidation.checkFormValidation.mockReturnValue(true);
  });

  afterEach(() => {
    if (actor) {
      actor.stop();
    }
  });

  describe('initial state', () => {
    it('should start in checkingAuth state and transition to idle when not authenticated', () => {
      actor = createActor(authMachine);
      actor.start();

      // Should transition to idle since checkStoredAuth returns isAuthenticated: false
      expect(actor.getSnapshot().value).toBe('idle');
    });

    it('should check stored auth on initialization', () => {
      mockAuthUtils.checkStoredAuth.mockReturnValue({
        authData: { accessToken: 'token123', id: '1', role: 'PATIENT' },
        isAuthenticated: true
      });

      actor = createActor(authMachine);
      actor.start();

      expect(mockAuthUtils.checkStoredAuth).toHaveBeenCalled();
      expect(actor.getSnapshot().context.isAuthenticated).toBe(true);
    });
  });

  describe('checkingAuth state', () => {
    it('should transition to authenticated when user is authenticated', () => {
      mockAuthUtils.checkStoredAuth.mockReturnValue({
        authData: { accessToken: 'token123', id: '1', role: 'PATIENT', status: 'ACTIVE' },
        isAuthenticated: true
      });

      actor = createActor(authMachine);
      actor.start();

      expect(actor.getSnapshot().value).toBe('authenticated');
      expect(actor.getSnapshot().context.isAuthenticated).toBe(true);
    });

    it('should transition to idle when user is not authenticated', () => {
      actor = createActor(authMachine);
      actor.start();

      expect(actor.getSnapshot().value).toBe('idle');
      expect(actor.getSnapshot().context.isAuthenticated).toBe(false);
    });

    it('should navigate to pending activation for inactive users', () => {
      mockAuthUtils.checkStoredAuth.mockReturnValue({
        authData: { accessToken: 'token123', id: '1', role: 'PATIENT', status: 'PENDING' },
        isAuthenticated: true
      });

      actor = createActor(authMachine);
      actor.start();

      expect(actor.getSnapshot().value).toBe('authenticated');

      // Wait for the setTimeout to execute
      vi.runAllTimers();

      expect(mockOrchestrator.send).toHaveBeenCalledWith({
        type: 'NAVIGATE',
        to: '/pending-activation'
      });
    });

    it('should set auth data for active users', () => {
      mockAuthUtils.checkStoredAuth.mockReturnValue({
        authData: { accessToken: 'token123', id: '1', role: 'PATIENT', status: 'ACTIVE' },
        isAuthenticated: true
      });

      actor = createActor(authMachine);
      actor.start();

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
    beforeEach(() => {
      mockAuthUtils.checkStoredAuth.mockReturnValue({
        authData: { accessToken: 'token123', id: '1', role: 'PATIENT', status: 'ACTIVE' },
        isAuthenticated: true
      });

      actor = createActor(authMachine);
      actor.start();
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
    beforeEach(() => {
      mockAuthUtils.checkStoredAuth.mockReturnValue({
        authData: { accessToken: 'token123', id: '1', role: 'PATIENT', status: 'ACTIVE' },
        isAuthenticated: true
      });

      actor = createActor(authMachine);
      actor.start();
      actor.send({ type: 'LOGOUT' });
    });

    it('should call logoutUser and transition to idle on success', async () => {
      mockAuthUtils.logoutUser.mockResolvedValue(undefined);

      // Wait for the promise to resolve
      await vi.waitFor(() => {
        expect(actor.getSnapshot().value).toBe('idle');
      });

      expect(mockAuthUtils.logoutUser).toHaveBeenCalled();
      expect(actor.getSnapshot().context.isAuthenticated).toBe(false);
      expect(actor.getSnapshot().context.authResponse).toBe(null);
      expect(mockOrchestrator.send).toHaveBeenCalledWith({ type: 'NAVIGATE', to: '/' });
    });

    it('should transition to idle on logout error', async () => {
      mockAuthUtils.logoutUser.mockRejectedValue(new Error('Logout failed'));

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
    beforeEach(() => {
      actor = createActor(authMachine);
      actor.start();
      actor.send({ type: 'SUBMIT' });
    });

    it('should transition to submitting when form is valid', () => {
      mockFormValidation.validateField.mockReturnValue('');
      mockFormValidation.checkFormValidation.mockReturnValue(false);

      // The transition should happen automatically based on the guard
      expect(actor.getSnapshot().value).toBe('submitting');
    });

    it('should transition to idle when form is invalid', () => {
      // Create a fresh actor for this test
      const testActor = createActor(authMachine);
      testActor.start();

      // Add a field that will be validated (starts with "user" since isPatient is true)
      testActor.send({ type: 'UPDATE_FORM', key: 'userEmail', value: 'invalid-email' });
      mockFormValidation.validateField.mockReturnValue('Invalid email format');

      // Send SUBMIT - should go to validating, then immediately to idle due to invalid form
      testActor.send({ type: 'SUBMIT' });

      expect(testActor.getSnapshot().value).toBe('idle');
      expect(testActor.getSnapshot().context.hasErrorsOrEmpty).toBe(true);
    });
  });

  describe('submitting state', () => {
    beforeEach(() => {
      actor = createActor(authMachine);
      actor.start();
      actor.send({ type: 'TOGGLE_MODE', mode: 'login' });
      actor.send({ type: 'SUBMIT' });
    });

    it('should set loading to true on entry', () => {
      expect(actor.getSnapshot().context.loading).toBe(true);
    });

    it('should handle successful registration and transition to idle', async () => {
      const mockRegisterResponse = {
        message: 'Registration successful',
        id: '456'
      };

      mockAuthUtils.submitAuthentication.mockResolvedValue(mockRegisterResponse);

      const testActor = createActor(authMachine);
      testActor.start();
      testActor.send({ type: 'UPDATE_FORM', key: 'email', value: 'test@example.com' });
      testActor.send({ type: 'TOGGLE_MODE', mode: 'register' });
      testActor.send({ type: 'SUBMIT' });

      await vi.waitFor(() => {
        expect(testActor.getSnapshot().value).toBe('idle');
      });

      expect(mockAuthUtils.submitAuthentication).toHaveBeenCalled();
      expect(testActor.getSnapshot().context.mode).toBe('login');
      expect(testActor.getSnapshot().context.isAuthenticated).toBe(false);
      expect(testActor.getSnapshot().context.loading).toBe(false);
      expect((testActor.getSnapshot().context.authResponse as any)?.message).toContain('Registration successful');
      expect(testActor.getSnapshot().context.formValues.email).toBe('test@example.com');
      
      testActor.stop();
    });

    it('should handle authentication error and transition to idle', async () => {
      const mockError = new Error('Invalid credentials');
      mockAuthUtils.submitAuthentication.mockRejectedValue(mockError);

      const testActor = createActor(authMachine);
      testActor.start();
      testActor.send({ type: 'TOGGLE_MODE', mode: 'login' });
      testActor.send({ type: 'SUBMIT' });

      await vi.waitFor(() => {
        expect(testActor.getSnapshot().value).toBe('idle');
      });

      expect(testActor.getSnapshot().context.loading).toBe(false);
      expect(testActor.getSnapshot().context.authResponse).toEqual({
        error: 'Invalid credentials'
      });
      
      testActor.stop();
    });

    it('should reset form values after successful login', async () => {
      const mockLoginResponse = {
        accessToken: 'token',
        refreshToken: 'refresh',
        id: '123',
        role: 'PATIENT',
        status: 'ACTIVE'
      };

      mockAuthUtils.submitAuthentication.mockResolvedValue(mockLoginResponse);

      const testActor = createActor(authMachine);
      testActor.start();
      testActor.send({ type: 'UPDATE_FORM', key: 'email', value: 'test@example.com' });
      testActor.send({ type: 'UPDATE_FORM', key: 'password', value: 'password123' });
      testActor.send({ type: 'TOGGLE_MODE', mode: 'login' });
      testActor.send({ type: 'SUBMIT' });

      await vi.waitFor(() => {
        expect(testActor.getSnapshot().value).toBe('authenticated');
      });

      expect(testActor.getSnapshot().context.formValues.email).toBe('');
      expect(testActor.getSnapshot().context.formValues.password).toBe('');
      expect(testActor.getSnapshot().context.formErrors).toEqual({});
      expect(testActor.getSnapshot().context.hasErrorsOrEmpty).toBe(true);
      
      testActor.stop();
    });

    it('should preserve email in form after successful registration', async () => {
      const mockRegisterResponse = {
        message: 'Registration successful',
        id: '456'
      };

      mockAuthUtils.submitAuthentication.mockResolvedValue(mockRegisterResponse);

      const testActor = createActor(authMachine);
      testActor.start();
      testActor.send({ type: 'UPDATE_FORM', key: 'email', value: 'newuser@example.com' });
      testActor.send({ type: 'UPDATE_FORM', key: 'name', value: 'John' });
      testActor.send({ type: 'TOGGLE_MODE', mode: 'register' });
      testActor.send({ type: 'SUBMIT' });

      await vi.waitFor(() => {
        expect(testActor.getSnapshot().value).toBe('idle');
      });

      expect(testActor.getSnapshot().context.formValues.email).toBe('newuser@example.com');
      expect(testActor.getSnapshot().context.formValues.name).toBe('');
      
      testActor.stop();
    });
  });

  describe('refreshingToken state', () => {
    it('should successfully refresh token and return to authenticated', async () => {
      const mockRefreshResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        id: '123',
        role: 'PATIENT',
        status: 'ACTIVE'
      };

      mockAuthUtils.checkStoredAuth.mockReturnValue({
        authData: { 
          accessToken: 'old-token', 
          refreshToken: 'old-refresh',
          id: '123', 
          role: 'PATIENT', 
          status: 'ACTIVE' 
        },
        isAuthenticated: true
      });

      mockAuthService.refreshToken.mockResolvedValue(mockRefreshResponse);

      const testActor = createActor(authMachine);
      testActor.start();
      testActor.send({ type: 'HANDLE_AUTH_ERROR', error: new Error('Token expired') });

      await vi.waitFor(() => {
        expect(testActor.getSnapshot().value).toBe('authenticated');
      });

      expect(mockAuthService.refreshToken).toHaveBeenCalledWith('old-refresh');
      expect(testActor.getSnapshot().context.authResponse).toEqual(mockRefreshResponse);
      
      testActor.stop();
    });

    it('should send updated auth data after successful token refresh', async () => {
      const mockRefreshResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        id: '123',
        role: 'DOCTOR',
        status: 'ACTIVE'
      };

      mockAuthUtils.checkStoredAuth.mockReturnValue({
        authData: { 
          accessToken: 'old-token', 
          refreshToken: 'old-refresh',
          id: '123', 
          role: 'DOCTOR', 
          status: 'ACTIVE' 
        },
        isAuthenticated: true
      });

      mockAuthService.refreshToken.mockResolvedValue(mockRefreshResponse);

      const testActor = createActor(authMachine);
      testActor.start();
      
      // Clear previous calls
      mockOrchestrator.send.mockClear();
      
      testActor.send({ type: 'HANDLE_AUTH_ERROR', error: new Error('Token expired') });

      await vi.waitFor(() => {
        expect(testActor.getSnapshot().value).toBe('authenticated');
      });

      // The context.send function should be called with SET_AUTH
      expect(mockOrchestrator.send).toHaveBeenCalledWith({
        type: 'SET_AUTH',
        accessToken: 'new-access-token',
        userId: '123',
        userRole: 'DOCTOR'
      });
      
      testActor.stop();
    });

    it('should transition to idle and navigate to login on refresh failure', async () => {
      mockAuthUtils.checkStoredAuth.mockReturnValue({
        authData: { 
          accessToken: 'old-token', 
          refreshToken: 'old-refresh',
          id: '123', 
          role: 'PATIENT', 
          status: 'ACTIVE' 
        },
        isAuthenticated: true
      });

      mockAuthService.refreshToken.mockRejectedValue(new Error('Refresh token expired'));

      const testActor = createActor(authMachine);
      testActor.start();
      testActor.send({ type: 'HANDLE_AUTH_ERROR', error: new Error('Token expired') });

      await vi.waitFor(() => {
        expect(testActor.getSnapshot().value).toBe('idle');
      });

      expect(testActor.getSnapshot().context.isAuthenticated).toBe(false);
      expect(testActor.getSnapshot().context.authResponse).toBe(null);
      expect(mockOrchestrator.send).toHaveBeenCalledWith({ type: 'NAVIGATE', to: '/' });
      expect(mockOrchestrator.send).toHaveBeenCalledWith({
        type: 'OPEN_SNACKBAR',
        message: 'Sesión expirada. Por favor, vuelve a iniciar sesión.',
        severity: 'error'
      });
      
      testActor.stop();
    });

    it('should handle missing refresh token error', async () => {
      mockAuthUtils.checkStoredAuth.mockReturnValue({
        authData: { 
          accessToken: 'token', 
          id: '123', 
          role: 'PATIENT', 
          status: 'ACTIVE' 
          // No refreshToken
        },
        isAuthenticated: true
      });

      const testActor = createActor(authMachine);
      testActor.start();
      testActor.send({ type: 'HANDLE_AUTH_ERROR', error: new Error('Token expired') });

      await vi.waitFor(() => {
        expect(testActor.getSnapshot().value).toBe('idle');
      });

      expect(testActor.getSnapshot().context.isAuthenticated).toBe(false);
      
      testActor.stop();
    });
  });

  describe('context management', () => {
    it('should initialize with default context', () => {
      actor = createActor(authMachine);
      actor.start();

      const context = actor.getSnapshot().context;
      expect(context.mode).toBe('login');
      expect(context.isPatient).toBe(true);
      expect(context.hasErrorsOrEmpty).toBe(true);
      expect(context.isAuthenticated).toBe(false);
      expect(context.loading).toBe(false);
      expect(context.formValues.email).toBe('');
      expect(context.formErrors).toEqual({});
    });

    it('should maintain context across state transitions', () => {
      actor = createActor(authMachine);
      actor.start();

      actor.send({ type: 'UPDATE_FORM', key: 'email', value: 'test@example.com' });
      actor.send({ type: 'TOGGLE_USER_TYPE', isPatient: false });

      expect(actor.getSnapshot().context.formValues.email).toBe('test@example.com');
      expect(actor.getSnapshot().context.isPatient).toBe(false);
    });
  });
});