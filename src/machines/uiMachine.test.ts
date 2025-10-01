import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createActor } from 'xstate';

// Mock dependencies BEFORE importing the machine
vi.mock('#/core/Orchestrator', () => ({
  orchestrator: {
    send: vi.fn(),
    sendToMachine: vi.fn(),
    registerMachine: vi.fn(),
  }
}));

import { uiMachine } from './uiMachine';
import { orchestrator } from '#/core/Orchestrator';

describe('uiMachine', () => {
  let actor: any;
  let mockOrchestrator: any;
  let mockNavigate: any;

  beforeEach(() => {
    vi.useFakeTimers();
    
    // Get mocked modules
    mockOrchestrator = vi.mocked(orchestrator);
    mockNavigate = vi.fn();

    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (actor) {
      actor.stop();
    }
    vi.useRealTimers();
  });

  describe('Initial State', () => {
    it('should start in idle state with default context', () => {
      actor = createActor(uiMachine, { input: { navigate: vi.fn() } });
      actor.start();

      expect(actor.getSnapshot().value).toBe('idle');
      expect(actor.getSnapshot().context.currentPath).toBe('/');
      expect(actor.getSnapshot().context.snackbar.open).toBe(false);
      expect(actor.getSnapshot().context.confirmDialog.open).toBe(false);
    });

    it('should initialize with default toggle states', () => {
      actor = createActor(uiMachine, { input: { navigate: vi.fn() } });
      actor.start();

      const toggleStates = actor.getSnapshot().context.toggleStates;
      expect(toggleStates.loadingApprove).toBe(false);
      expect(toggleStates.loadingReject).toBe(false);
    });

    it('should have a default navigate function', () => {
      actor = createActor(uiMachine, { input: { navigate: vi.fn() } });
      actor.start();

      expect(typeof actor.getSnapshot().context.navigate).toBe('function');
    });
  });

  describe('ADD_NAVIGATE_HOOK Event', () => {
    it('should set navigate function from event', () => {
      actor = createActor(uiMachine, { input: { navigate: vi.fn() } });
      actor.start();

      actor.send({
        type: 'ADD_NAVIGATE_HOOK',
        navigate: mockNavigate,
        initialPath: '/dashboard',
      });

      expect(actor.getSnapshot().context.navigate).toBe(mockNavigate);
      expect(actor.getSnapshot().context.currentPath).toBe('/dashboard');
    });

    it('should use default path if initialPath is not provided', () => {
      actor = createActor(uiMachine, { input: { navigate: vi.fn() } });
      actor.start();

      actor.send({
        type: 'ADD_NAVIGATE_HOOK',
        navigate: mockNavigate,
        initialPath: '',
      });

      expect(actor.getSnapshot().context.currentPath).toBe('/');
    });
  });

  describe('TOGGLE Event', () => {
    it('should toggle a boolean state from false to true', () => {
      actor = createActor(uiMachine, { input: { navigate: vi.fn() } });
      actor.start();

      actor.send({ type: 'TOGGLE', key: 'loadingApprove' });

      expect(actor.getSnapshot().context.toggleStates.loadingApprove).toBe(true);
    });

    it('should toggle a boolean state from true to false', () => {
      actor = createActor(uiMachine, { input: { navigate: vi.fn() } });
      actor.start();

      actor.send({ type: 'TOGGLE', key: 'loadingApprove' });
      actor.send({ type: 'TOGGLE', key: 'loadingApprove' });

      expect(actor.getSnapshot().context.toggleStates.loadingApprove).toBe(false);
    });

    it('should toggle multiple independent states', () => {
      actor = createActor(uiMachine, { input: { navigate: vi.fn() } });
      actor.start();

      actor.send({ type: 'TOGGLE', key: 'loadingApprove' });
      actor.send({ type: 'TOGGLE', key: 'loadingReject' });

      const toggleStates = actor.getSnapshot().context.toggleStates;
      expect(toggleStates.loadingApprove).toBe(true);
      expect(toggleStates.loadingReject).toBe(true);
    });

    it('should create new toggle state if key does not exist', () => {
      actor = createActor(uiMachine, { input: { navigate: vi.fn() } });
      actor.start();

      actor.send({ type: 'TOGGLE', key: 'customToggle' });

      expect(actor.getSnapshot().context.toggleStates.customToggle).toBe(true);
    });

    it('should preserve other toggle states when toggling one', () => {
      actor = createActor(uiMachine, { input: { navigate: vi.fn() } });
      actor.start();

      actor.send({ type: 'TOGGLE', key: 'loadingApprove' });
      actor.send({ type: 'TOGGLE', key: 'loadingReject' });

      const toggleStates = actor.getSnapshot().context.toggleStates;
      expect(toggleStates.loadingApprove).toBe(true);
      expect(toggleStates.loadingReject).toBe(true);
    });
  });

  describe('NAVIGATE Event', () => {
    it('should call navigate function with path', () => {
      actor = createActor(uiMachine, { input: { navigate: vi.fn() } });
      actor.start();

      actor.send({
        type: 'ADD_NAVIGATE_HOOK',
        navigate: mockNavigate,
        initialPath: '/',
      });

      actor.send({ type: 'NAVIGATE', to: '/dashboard' });

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('should update currentPath after navigation', () => {
      actor = createActor(uiMachine, { input: { navigate: vi.fn() } });
      actor.start();

      actor.send({
        type: 'ADD_NAVIGATE_HOOK',
        navigate: mockNavigate,
        initialPath: '/',
      });

      actor.send({ type: 'NAVIGATE', to: '/profile' });

      expect(actor.getSnapshot().context.currentPath).toBe('/profile');
    });

    it('should not navigate if path is null', () => {
      actor = createActor(uiMachine, { input: { navigate: vi.fn() } });
      actor.start();

      actor.send({
        type: 'ADD_NAVIGATE_HOOK',
        navigate: mockNavigate,
        initialPath: '/home',
      });

      const initialPath = actor.getSnapshot().context.currentPath;
      actor.send({ type: 'NAVIGATE', to: null });

      expect(mockNavigate).not.toHaveBeenCalled();
      expect(actor.getSnapshot().context.currentPath).toBe(initialPath);
    });

    it('should navigate to multiple paths sequentially', () => {
      actor = createActor(uiMachine, { input: { navigate: vi.fn() } });
      actor.start();

      actor.send({
        type: 'ADD_NAVIGATE_HOOK',
        navigate: mockNavigate,
        initialPath: '/',
      });

      actor.send({ type: 'NAVIGATE', to: '/page1' });
      actor.send({ type: 'NAVIGATE', to: '/page2' });
      actor.send({ type: 'NAVIGATE', to: '/page3' });

      expect(mockNavigate).toHaveBeenCalledTimes(3);
      expect(mockNavigate).toHaveBeenNthCalledWith(1, '/page1');
      expect(mockNavigate).toHaveBeenNthCalledWith(2, '/page2');
      expect(mockNavigate).toHaveBeenNthCalledWith(3, '/page3');
      expect(actor.getSnapshot().context.currentPath).toBe('/page3');
    });
  });

  describe('OPEN_SNACKBAR Event', () => {
    it('should open snackbar with success message', () => {
      actor = createActor(uiMachine, { input: { navigate: vi.fn() } });
      actor.start();

      actor.send({
        type: 'OPEN_SNACKBAR',
        message: 'Operation successful',
        severity: 'success',
      });

      const snackbar = actor.getSnapshot().context.snackbar;
      expect(snackbar.open).toBe(true);
      expect(snackbar.message).toBe('Operation successful');
      expect(snackbar.severity).toBe('success');
    });

    it('should open snackbar with error message', () => {
      actor = createActor(uiMachine, { input: { navigate: vi.fn() } });
      actor.start();

      actor.send({
        type: 'OPEN_SNACKBAR',
        message: 'An error occurred',
        severity: 'error',
      });

      const snackbar = actor.getSnapshot().context.snackbar;
      expect(snackbar.open).toBe(true);
      expect(snackbar.message).toBe('An error occurred');
      expect(snackbar.severity).toBe('error');
    });

    it('should open snackbar with warning message', () => {
      actor = createActor(uiMachine, { input: { navigate: vi.fn() } });
      actor.start();

      actor.send({
        type: 'OPEN_SNACKBAR',
        message: 'Warning message',
        severity: 'warning',
      });

      const snackbar = actor.getSnapshot().context.snackbar;
      expect(snackbar.open).toBe(true);
      expect(snackbar.message).toBe('Warning message');
      expect(snackbar.severity).toBe('warning');
    });

    it('should open snackbar with info message', () => {
      actor = createActor(uiMachine, { input: { navigate: vi.fn() } });
      actor.start();

      actor.send({
        type: 'OPEN_SNACKBAR',
        message: 'Info message',
        severity: 'info',
      });

      const snackbar = actor.getSnapshot().context.snackbar;
      expect(snackbar.open).toBe(true);
      expect(snackbar.message).toBe('Info message');
      expect(snackbar.severity).toBe('info');
    });

    it('should auto-close snackbar after 6 seconds', () => {
      actor = createActor(uiMachine, { input: { navigate: vi.fn() } });
      actor.start();

      actor.send({
        type: 'OPEN_SNACKBAR',
        message: 'Auto close test',
        severity: 'info',
      });

      expect(actor.getSnapshot().context.snackbar.open).toBe(true);

      // Fast-forward time by 6 seconds
      vi.advanceTimersByTime(6000);

      expect(mockOrchestrator.send).toHaveBeenCalledWith({ type: 'CLOSE_SNACKBAR' });
    });

    it('should replace previous snackbar message', () => {
      actor = createActor(uiMachine, { input: { navigate: vi.fn() } });
      actor.start();

      actor.send({
        type: 'OPEN_SNACKBAR',
        message: 'First message',
        severity: 'info',
      });

      actor.send({
        type: 'OPEN_SNACKBAR',
        message: 'Second message',
        severity: 'success',
      });

      const snackbar = actor.getSnapshot().context.snackbar;
      expect(snackbar.message).toBe('Second message');
      expect(snackbar.severity).toBe('success');
    });
  });

  describe('CLOSE_SNACKBAR Event', () => {
    it('should close snackbar', () => {
      actor = createActor(uiMachine, { input: { navigate: vi.fn() } });
      actor.start();

      actor.send({
        type: 'OPEN_SNACKBAR',
        message: 'Test message',
        severity: 'info',
      });

      expect(actor.getSnapshot().context.snackbar.open).toBe(true);

      actor.send({ type: 'CLOSE_SNACKBAR' });

      expect(actor.getSnapshot().context.snackbar.open).toBe(false);
    });

    it('should send NOTIFICATION_CLOSED event to orchestrator', () => {
      actor = createActor(uiMachine, { input: { navigate: vi.fn() } });
      actor.start();

      actor.send({
        type: 'OPEN_SNACKBAR',
        message: 'Test message',
        severity: 'info',
      });

      actor.send({ type: 'CLOSE_SNACKBAR' });

      expect(mockOrchestrator.send).toHaveBeenCalledWith({ type: 'NOTIFICATION_CLOSED' });
    });

    it('should preserve snackbar message and severity when closing', () => {
      actor = createActor(uiMachine, { input: { navigate: vi.fn() } });
      actor.start();

      actor.send({
        type: 'OPEN_SNACKBAR',
        message: 'Test message',
        severity: 'success',
      });

      actor.send({ type: 'CLOSE_SNACKBAR' });

      const snackbar = actor.getSnapshot().context.snackbar;
      expect(snackbar.open).toBe(false);
      expect(snackbar.message).toBe('Test message');
      expect(snackbar.severity).toBe('success');
    });
  });

  describe('OPEN_CONFIRMATION_DIALOG Event', () => {
    it('should open confirmation dialog for approve action', () => {
      actor = createActor(uiMachine, { input: { navigate: vi.fn() } });
      actor.start();

      actor.send({
        type: 'OPEN_CONFIRMATION_DIALOG',
        action: 'approve',
        requestId: 'request-123',
      });

      const confirmDialog = actor.getSnapshot().context.confirmDialog;
      expect(confirmDialog.open).toBe(true);
      expect(confirmDialog.action).toBe('approve');
      expect(confirmDialog.requestId).toBe('request-123');
    });

    it('should open confirmation dialog for reject action', () => {
      actor = createActor(uiMachine, { input: { navigate: vi.fn() } });
      actor.start();

      actor.send({
        type: 'OPEN_CONFIRMATION_DIALOG',
        action: 'reject',
        requestId: 'request-456',
      });

      const confirmDialog = actor.getSnapshot().context.confirmDialog;
      expect(confirmDialog.open).toBe(true);
      expect(confirmDialog.action).toBe('reject');
      expect(confirmDialog.requestId).toBe('request-456');
    });

    it('should replace previous confirmation dialog', () => {
      actor = createActor(uiMachine, { input: { navigate: vi.fn() } });
      actor.start();

      actor.send({
        type: 'OPEN_CONFIRMATION_DIALOG',
        action: 'approve',
        requestId: 'request-1',
      });

      actor.send({
        type: 'OPEN_CONFIRMATION_DIALOG',
        action: 'reject',
        requestId: 'request-2',
      });

      const confirmDialog = actor.getSnapshot().context.confirmDialog;
      expect(confirmDialog.action).toBe('reject');
      expect(confirmDialog.requestId).toBe('request-2');
    });
  });

  describe('CLOSE_CONFIRMATION_DIALOG Event', () => {
    it('should close confirmation dialog', () => {
      actor = createActor(uiMachine, { input: { navigate: vi.fn() } });
      actor.start();

      actor.send({
        type: 'OPEN_CONFIRMATION_DIALOG',
        action: 'approve',
        requestId: 'request-123',
      });

      expect(actor.getSnapshot().context.confirmDialog.open).toBe(true);

      actor.send({ type: 'CLOSE_CONFIRMATION_DIALOG' });

      const confirmDialog = actor.getSnapshot().context.confirmDialog;
      expect(confirmDialog.open).toBe(false);
      expect(confirmDialog.action).toBeNull();
      expect(confirmDialog.requestId).toBeNull();
    });

    it('should reset all confirmation dialog properties', () => {
      actor = createActor(uiMachine, { input: { navigate: vi.fn() } });
      actor.start();

      actor.send({
        type: 'OPEN_CONFIRMATION_DIALOG',
        action: 'reject',
        requestId: 'request-789',
      });

      actor.send({ type: 'CLOSE_CONFIRMATION_DIALOG' });

      const confirmDialog = actor.getSnapshot().context.confirmDialog;
      expect(confirmDialog).toEqual({
        open: false,
        action: null,
        requestId: null,
        turnId: null,
        turnData: null,
      });
    });
  });

  describe('State Persistence', () => {
    it('should maintain state across multiple operations', () => {
      actor = createActor(uiMachine, { input: { navigate: vi.fn() } });
      actor.start();

      actor.send({
        type: 'ADD_NAVIGATE_HOOK',
        navigate: mockNavigate,
        initialPath: '/home',
      });

      actor.send({ type: 'TOGGLE', key: 'loadingApprove' });

      actor.send({
        type: 'OPEN_SNACKBAR',
        message: 'Test',
        severity: 'success',
      });

      const context = actor.getSnapshot().context;
      expect(context.currentPath).toBe('/home');
      expect(context.toggleStates.loadingApprove).toBe(true);
      expect(context.snackbar.open).toBe(true);
    });

    it('should remain in idle state during all operations', () => {
      actor = createActor(uiMachine, { input: { navigate: vi.fn() } });
      actor.start();

      const events = [
        { type: 'TOGGLE', key: 'test' },
        { type: 'NAVIGATE', to: '/test' },
        { type: 'OPEN_SNACKBAR', message: 'Test', severity: 'info' },
        { type: 'CLOSE_SNACKBAR' },
        { type: 'OPEN_CONFIRMATION_DIALOG', action: 'approve', requestId: 'test' },
        { type: 'CLOSE_CONFIRMATION_DIALOG' },
      ];

      actor.send({
        type: 'ADD_NAVIGATE_HOOK',
        navigate: mockNavigate,
        initialPath: '/',
      });

      events.forEach(event => {
        actor.send(event as any);
        expect(actor.getSnapshot().value).toBe('idle');
      });
    });
  });

  describe('Complex Workflows', () => {
    it('should handle navigation with snackbar notification', () => {
      actor = createActor(uiMachine, { input: { navigate: vi.fn() } });
      actor.start();

      actor.send({
        type: 'ADD_NAVIGATE_HOOK',
        navigate: mockNavigate,
        initialPath: '/',
      });

      actor.send({ type: 'NAVIGATE', to: '/profile' });
      actor.send({
        type: 'OPEN_SNACKBAR',
        message: 'Profile loaded',
        severity: 'success',
      });

      expect(mockNavigate).toHaveBeenCalledWith('/profile');
      expect(actor.getSnapshot().context.snackbar.message).toBe('Profile loaded');
    });

    it('should handle confirmation dialog with toggle states', () => {
      actor = createActor(uiMachine, { input: { navigate: vi.fn() } });
      actor.start();

      actor.send({ type: 'TOGGLE', key: 'loadingApprove' });
      actor.send({
        type: 'OPEN_CONFIRMATION_DIALOG',
        action: 'approve',
        requestId: 'req-1',
      });

      const context = actor.getSnapshot().context;
      expect(context.toggleStates.loadingApprove).toBe(true);
      expect(context.confirmDialog.open).toBe(true);
    });

    it('should handle multiple snackbar messages with auto-close', () => {
      actor = createActor(uiMachine, { input: { navigate: vi.fn() } });
      actor.start();

      actor.send({
        type: 'OPEN_SNACKBAR',
        message: 'First message',
        severity: 'info',
      });

      vi.advanceTimersByTime(3000);

      actor.send({
        type: 'OPEN_SNACKBAR',
        message: 'Second message',
        severity: 'success',
      });

      // First message timer
      vi.advanceTimersByTime(3000);
      expect(mockOrchestrator.send).toHaveBeenCalledTimes(1);

      // Second message timer
      vi.advanceTimersByTime(3000);
      expect(mockOrchestrator.send).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle toggling undefined key', () => {
      actor = createActor(uiMachine, { input: { navigate: vi.fn() } });
      actor.start();

      actor.send({ type: 'TOGGLE', key: 'nonExistentKey' });

      expect(actor.getSnapshot().context.toggleStates.nonExistentKey).toBe(true);
    });

    it('should handle closing snackbar when not open', () => {
      actor = createActor(uiMachine, { input: { navigate: vi.fn() } });
      actor.start();

      expect(actor.getSnapshot().context.snackbar.open).toBe(false);

      actor.send({ type: 'CLOSE_SNACKBAR' });

      expect(actor.getSnapshot().context.snackbar.open).toBe(false);
      expect(mockOrchestrator.send).toHaveBeenCalledWith({ type: 'NOTIFICATION_CLOSED' });
    });

    it('should handle closing confirmation dialog when not open', () => {
      actor = createActor(uiMachine, { input: { navigate: vi.fn() } });
      actor.start();

      expect(actor.getSnapshot().context.confirmDialog.open).toBe(false);

      actor.send({ type: 'CLOSE_CONFIRMATION_DIALOG' });

      expect(actor.getSnapshot().context.confirmDialog.open).toBe(false);
    });

    it('should handle empty string navigation path', () => {
      actor = createActor(uiMachine, { input: { navigate: vi.fn() } });
      actor.start();

      actor.send({
        type: 'ADD_NAVIGATE_HOOK',
        navigate: mockNavigate,
        initialPath: '/home',
      });

      const initialPath = actor.getSnapshot().context.currentPath;
      actor.send({ type: 'NAVIGATE', to: '' });

      // Empty string is falsy in the condition, so navigation should NOT happen
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(actor.getSnapshot().context.currentPath).toBe(initialPath);
    });
  });
});
