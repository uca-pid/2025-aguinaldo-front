import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Orchestrator } from './Orchestrator';
import { createActor } from 'xstate';

// Mock xstate
vi.mock('xstate', () => ({
  createActor: vi.fn(),
}));

describe('Orchestrator', () => {
  let orchestrator: Orchestrator;
  let mockMachine: any;
  let mockActor: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock machine and actor
    mockActor = {
      start: vi.fn(),
      stop: vi.fn(),
      send: vi.fn(),
      getSnapshot: vi.fn(),
      subscribe: vi.fn(),
    };

    mockMachine = {
      id: 'test-machine',
    };

    (createActor as any).mockReturnValue(mockActor);

    orchestrator = new Orchestrator();
  });

  afterEach(() => {
    orchestrator.destroy();
  });

  describe('registerMachine', () => {
    it('should register a machine successfully', () => {
      const registration = {
        id: 'test-machine',
        machine: mockMachine,
        eventTypes: ['EVENT_1', 'EVENT_2'],
        input: { initialData: 'test' },
      };

      orchestrator.registerMachine(registration);

      expect(createActor).toHaveBeenCalledWith(mockMachine, { input: { initialData: 'test' } });
      expect(mockActor.start).toHaveBeenCalled();
    });

    it('should not register duplicate machines', () => {
      const registration = {
        id: 'test-machine',
        machine: mockMachine,
        eventTypes: ['EVENT_1'],
      };

      orchestrator.registerMachine(registration);

      // Second registration should be skipped (no error, just returns early)
      expect(() => orchestrator.registerMachine(registration)).not.toThrow();

      // Should still only have one machine registered
      expect(orchestrator.getMachineIds()).toHaveLength(1);
      expect(orchestrator.getMachine('test-machine')).toBeDefined();
    });

    it('should handle actor creation errors', () => {
      (createActor as any).mockImplementation(() => {
        throw new Error('Actor creation failed');
      });

      const registration = {
        id: 'test-machine',
        machine: mockMachine,
        eventTypes: ['EVENT_1'],
      };

      expect(() => orchestrator.registerMachine(registration)).toThrow(
        'Failed to create actor for machine "test-machine": Error: Actor creation failed'
      );
    });

    it('should subscribe to event types', () => {
      const registration = {
        id: 'test-machine',
        machine: mockMachine,
        eventTypes: ['EVENT_1', 'EVENT_2'],
      };

      orchestrator.registerMachine(registration);

      // Should have subscribed to both events
      expect(orchestrator.getEventTypes()).toContain('EVENT_1');
      expect(orchestrator.getEventTypes()).toContain('EVENT_2');
    });
  });

  describe('unregisterMachine', () => {
    it('should unregister a machine successfully', () => {
      const registration = {
        id: 'test-machine',
        machine: mockMachine,
        eventTypes: ['EVENT_1'],
      };

      orchestrator.registerMachine(registration);
      orchestrator.unregisterMachine('test-machine');

      expect(mockActor.stop).toHaveBeenCalled();
      expect(orchestrator.getMachine('test-machine')).toBeUndefined();
    });

    it('should throw error for unregistered machine', () => {
      expect(() => orchestrator.unregisterMachine('non-existent')).toThrow(
        'Machine with id "non-existent" is not registered'
      );
    });
  });

  describe('sendToMachine', () => {
    it('should send event to specific machine', () => {
      const registration = {
        id: 'test-machine',
        machine: mockMachine,
        eventTypes: ['EVENT_1'],
      };

      orchestrator.registerMachine(registration);
      const testEvent = { type: 'TEST_EVENT', payload: 'data' };

      orchestrator.sendToMachine('test-machine', testEvent);

      expect(mockActor.send).toHaveBeenCalledWith(testEvent);
    });

    it('should throw error for unregistered machine', () => {
      expect(() => orchestrator.sendToMachine('non-existent', { type: 'TEST' })).toThrow(
        'Machine with id "non-existent" is not registered'
      );
    });
  });

  describe('getSnapshot', () => {
    it('should return machine snapshot', () => {
      const mockSnapshot = { value: 'idle', context: {} };
      mockActor.getSnapshot.mockReturnValue(mockSnapshot);

      const registration = {
        id: 'test-machine',
        machine: mockMachine,
        eventTypes: ['EVENT_1'],
      };

      orchestrator.registerMachine(registration);

      const snapshot = orchestrator.getSnapshot('test-machine');
      expect(snapshot).toEqual(mockSnapshot);
      expect(mockActor.getSnapshot).toHaveBeenCalled();
    });

    it('should throw error for unregistered machine', () => {
      expect(() => orchestrator.getSnapshot('non-existent')).toThrow(
        'Machine with id "non-existent" is not registered'
      );
    });
  });

  describe('send (broadcast)', () => {
    it('should broadcast event to all subscribers', () => {
      const mockListener = vi.fn();
      orchestrator.subscribe('TEST_EVENT', mockListener);

      const testEvent = { type: 'TEST_EVENT', payload: 'data' };
      orchestrator.send(testEvent);

      expect(mockListener).toHaveBeenCalledWith(testEvent);
    });
  });

  describe('subscribe/unsubscribe', () => {
    it('should subscribe and unsubscribe from events', () => {
      const mockListener = vi.fn();
      const subscription = orchestrator.subscribe('TEST_EVENT', mockListener);

      expect(orchestrator.getEventTypes()).toContain('TEST_EVENT');

      subscription.unsubscribe();
      expect(orchestrator.getEventTypes()).not.toContain('TEST_EVENT');
    });

    it('should handle multiple subscribers for same event', () => {
      const mockListener1 = vi.fn();
      const mockListener2 = vi.fn();

      const sub1 = orchestrator.subscribe('TEST_EVENT', mockListener1);
      const sub2 = orchestrator.subscribe('TEST_EVENT', mockListener2);

      orchestrator.emit('TEST_EVENT', { data: 'test' });

      expect(mockListener1).toHaveBeenCalled();
      expect(mockListener2).toHaveBeenCalled();

      sub1.unsubscribe();
      sub2.unsubscribe();
    });

    it('should handle listener errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const errorListener = vi.fn().mockImplementation(() => {
        throw new Error('Listener error');
      });

      orchestrator.subscribe('TEST_EVENT', errorListener);
      orchestrator.emit('TEST_EVENT', {});

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Orchestrator] Error in event listener for TEST_EVENT:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('getMachineIds and getMachine', () => {
    it('should return registered machine IDs', () => {
      const registration = {
        id: 'test-machine',
        machine: mockMachine,
        eventTypes: ['EVENT_1'],
      };

      orchestrator.registerMachine(registration);

      expect(orchestrator.getMachineIds()).toContain('test-machine');
      expect(orchestrator.getMachine('test-machine')).toBeDefined();
    });
  });

  describe('getMachineEventTypes', () => {
    it('should return event types for machine', () => {
      const eventTypes = ['EVENT_1', 'EVENT_2'];
      const registration = {
        id: 'test-machine',
        machine: mockMachine,
        eventTypes,
      };

      orchestrator.registerMachine(registration);

      expect(orchestrator.getMachineEventTypes('test-machine')).toEqual(eventTypes);
    });
  });

  describe('destroy', () => {
    it('should cleanup all machines and subscriptions', () => {
      const registration = {
        id: 'test-machine',
        machine: mockMachine,
        eventTypes: ['EVENT_1'],
      };

      orchestrator.registerMachine(registration);
      orchestrator.subscribe('TEST_EVENT', vi.fn());

      orchestrator.destroy();

      expect(mockActor.stop).toHaveBeenCalled();
      expect(orchestrator.getMachineIds()).toHaveLength(0);
      expect(orchestrator.getEventTypes()).toHaveLength(0);
    });
  });

  describe('debug mode', () => {
    it('should log debug information when enabled', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const debugOrchestrator = new Orchestrator({ debug: true });

      const registration = {
        id: 'test-machine',
        machine: mockMachine,
        eventTypes: ['EVENT_1'],
      };

      debugOrchestrator.registerMachine(registration);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Orchestrator] Registered machine "test-machine" with event types:',
        ['EVENT_1']
      );

      consoleSpy.mockRestore();
      debugOrchestrator.destroy();
    });
  });
});