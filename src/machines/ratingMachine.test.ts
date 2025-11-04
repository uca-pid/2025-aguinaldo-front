import { describe, it, expect } from 'vitest';
import { interpret } from 'xstate';
import { ratingMachine, RatingMachineDefaultContext } from './ratingMachine';

describe('ratingMachine', () => {
  let machine: ReturnType<typeof interpret>;

  beforeEach(() => {
    machine = interpret(ratingMachine);
    machine.start();
  });

  afterEach(() => {
    machine.stop();
  });

  it('should start in idle state with default context', () => {
    expect(machine.getSnapshot().value).toBe('idle');
    expect(machine.getSnapshot().context).toEqual(RatingMachineDefaultContext);
  });

  describe('idle state', () => {

    it('should set rating on SET_RATING event', () => {
      machine.send({ type: 'SET_RATING', rating: 5 });

      expect(machine.getSnapshot().context.rating).toBe(5);
      expect(machine.getSnapshot().value).toBe('idle');
    });

    it('should set subcategories on SET_SUBCATEGORIES event', () => {
      const subcategories = ['friendly', 'punctual'];
      machine.send({ type: 'SET_SUBCATEGORIES', subcategories });

      expect(machine.getSnapshot().context.subcategories).toEqual(subcategories);
      expect(machine.getSnapshot().value).toBe('idle');
    });

    it('should reset rating and subcategories on RESET_RATING event', () => {
      machine.send({ type: 'SET_RATING', rating: 4 });
      machine.send({ type: 'SET_SUBCATEGORIES', subcategories: ['test'] });

      machine.send({ type: 'RESET_RATING' });

      expect(machine.getSnapshot().context.rating).toBe(0);
      expect(machine.getSnapshot().context.subcategories).toEqual([]);
      expect(machine.getSnapshot().value).toBe('idle');
    });

    it('should transition to submitting and set loading on START_SUBMIT event', () => {
      machine.send({ type: 'START_SUBMIT' });

      expect(machine.getSnapshot().value).toBe('submitting');
      expect(machine.getSnapshot().context.loading).toBe(true);
    });
  });

  describe('submitting state', () => {

    it('should transition to idle and reset context on SUBMIT_SUCCESS', () => {
      machine.send({ type: 'START_SUBMIT' });
      machine.send({ type: 'SET_RATING', rating: 3 });
      machine.send({ type: 'SET_SUBCATEGORIES', subcategories: ['test'] });

      machine.send({ type: 'SUBMIT_SUCCESS' });

      expect(machine.getSnapshot().value).toBe('idle');
      expect(machine.getSnapshot().context).toEqual(RatingMachineDefaultContext);
    });

    it('should transition to idle and set loading to false on SUBMIT_ERROR', () => {
      machine.send({ type: 'START_SUBMIT' });
      machine.send({ type: 'SUBMIT_ERROR' });

      expect(machine.getSnapshot().value).toBe('idle');
      expect(machine.getSnapshot().context.loading).toBe(false);
      expect(machine.getSnapshot().context.rating).toBe(0); // Should not reset rating on error
      expect(machine.getSnapshot().context.subcategories).toEqual([]); // Should not reset subcategories on error
    });
  });

  describe('context management', () => {

    it('should maintain context across state transitions', () => {
      machine.send({ type: 'SET_RATING', rating: 4 });
      machine.send({ type: 'SET_SUBCATEGORIES', subcategories: ['friendly', 'professional'] });

      expect(machine.getSnapshot().context.rating).toBe(4);
      expect(machine.getSnapshot().context.subcategories).toEqual(['friendly', 'professional']);
      expect(machine.getSnapshot().context.loading).toBe(false);

      machine.send({ type: 'START_SUBMIT' });

      expect(machine.getSnapshot().context.rating).toBe(4);
      expect(machine.getSnapshot().context.subcategories).toEqual(['friendly', 'professional']);
      expect(machine.getSnapshot().context.loading).toBe(true);
    });

    it('should handle multiple SET_RATING events', () => {
      machine.send({ type: 'SET_RATING', rating: 2 });
      expect(machine.getSnapshot().context.rating).toBe(2);

      machine.send({ type: 'SET_RATING', rating: 5 });
      expect(machine.getSnapshot().context.rating).toBe(5);
    });

    it('should handle multiple SET_SUBCATEGORIES events', () => {
      machine.send({ type: 'SET_SUBCATEGORIES', subcategories: ['a'] });
      expect(machine.getSnapshot().context.subcategories).toEqual(['a']);

      machine.send({ type: 'SET_SUBCATEGORIES', subcategories: ['b', 'c'] });
      expect(machine.getSnapshot().context.subcategories).toEqual(['b', 'c']);
    });
  });
});