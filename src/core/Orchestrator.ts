import { createActor, type AnyStateMachine, type AnyActor } from 'xstate';

type EventListener<T = any> = (event: T) => void;

interface EventSubscription {
  unsubscribe: () => void;
}

interface MachineRegistration {
  id: string;
  machine: AnyStateMachine;
  eventTypes: string[]; // Event types this machine can handle
  input?: any; // Initial input for the machine
}

interface RegisteredMachine {
  id: string;
  machine: AnyStateMachine;
  actor: AnyActor;
  eventTypes: string[];
  subscriptions: EventSubscription[];
  registration: MachineRegistration;
}

export class Orchestrator {
  private eventListeners: Map<string, Set<EventListener>> = new Map();
  private machines: Map<string, RegisteredMachine> = new Map();
  private debug: boolean = false;

  constructor(options?: { debug?: boolean }) {
    this.debug = options?.debug || false;
  }


  registerMachine(registration: MachineRegistration): void {
    const { id, machine, eventTypes, input } = registration;

    if (this.machines.has(id)) {
      throw new Error(`Machine with id "${id}" is already registered`);
    }

    let actor: AnyActor;
    
    try {
      actor = createActor(machine, input ? { input } : undefined);
    } catch (error) {
      throw new Error(`Failed to create actor for machine "${id}": ${error}`);
    }

    const subscriptions: EventSubscription[] = [];
    
    eventTypes.forEach(eventType => {
      const subscription = this.subscribe(eventType, (event) => {
        if (this.debug) {
          console.log(`[Orchestrator] Sending event "${eventType}" to machine "${id}":`, event);
        }
        actor.send(event);
      });
      subscriptions.push(subscription);
    });

    this.machines.set(id, {
      id,
      machine,
      actor,
      eventTypes,
      subscriptions,
      registration
    });

    actor.start();

    if (this.debug) {
      console.log(`[Orchestrator] Registered machine "${id}" with event types:`, eventTypes);
    }

    this.emit('MACHINE_REGISTERED', { machineId: id, eventTypes });
  }


  unregisterMachine(id: string): void {
    const registeredMachine = this.machines.get(id);
    if (!registeredMachine) {
      throw new Error(`Machine with id "${id}" is not registered`);
    }

    registeredMachine.subscriptions.forEach(sub => sub.unsubscribe());

    registeredMachine.actor.stop();

    this.machines.delete(id);

    if (this.debug) {
      console.log(`[Orchestrator] Unregistered machine "${id}"`);
    }

    this.emit('MACHINE_UNREGISTERED', { machineId: id });
  }

  getMachine(id: string): RegisteredMachine | undefined {
    return this.machines.get(id);
  }


  getMachineIds(): string[] {
    return Array.from(this.machines.keys());
  }

  send(event: any): void {
    if (this.debug) {
      console.log(`[Orchestrator] Broadcasting event to all machines:`, event);
    }

    this.emit(event.type, event);
  }

  sendToMachine(machineId: string, event: any): void {
    const machine = this.machines.get(machineId);
    if (!machine) {
      throw new Error(`Machine with id "${machineId}" is not registered`);
    }

    if (this.debug) {
      console.log(`[Orchestrator] Sending event to machine "${machineId}":`, event);
    }

    machine.actor.send(event);
  }

  getSnapshot(machineId: string): any {
    const machine = this.machines.get(machineId);
    if (!machine) {
      throw new Error(`Machine with id "${machineId}" is not registered`);
    }

    return machine.actor.getSnapshot();
  }

  getMachineEventTypes(machineId: string): string[] {
    const machine = this.machines.get(machineId);
    if (!machine) {
      throw new Error(`Machine with id "${machineId}" is not registered`);
    }

    return machine.eventTypes;
  }

  subscribe<T = any>(eventType: string, listener: EventListener<T>): EventSubscription {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    
    this.eventListeners.get(eventType)!.add(listener);

    return {
      unsubscribe: () => {
        const typeListeners = this.eventListeners.get(eventType);
        if (typeListeners) {
          typeListeners.delete(listener);
          if (typeListeners.size === 0) {
            this.eventListeners.delete(eventType);
          }
        }
      }
    };
  }

  emit<T = any>(eventType: string, event: T): void {
    if (this.debug) {
      console.log(`[Orchestrator] Emitting event "${eventType}":`, event);
    }

    const typeListeners = this.eventListeners.get(eventType);
    if (typeListeners) {
      typeListeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error(`[Orchestrator] Error in event listener for ${eventType}:`, error);
        }
      });
    }
  }

  getEventTypes(): string[] {
    return Array.from(this.eventListeners.keys());
  }

  destroy(): void {
    const machineIds = Array.from(this.machines.keys());
    machineIds.forEach(id => this.unregisterMachine(id));

    this.eventListeners.clear();

    if (this.debug) {
      console.log('[Orchestrator] Destroyed');
    }
  }
}

export const orchestrator = new Orchestrator();
