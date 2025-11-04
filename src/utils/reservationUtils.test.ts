import { describe, it, expect, vi } from 'vitest';
import {
  splitSubcategory,
  buildAvailableSubcats,
  buildDoctorSubcatMap,
  buildFilteredDoctors,
  requestRatedCountsForDoctors
} from './reservationUtils';
import { orchestrator } from '#/core/Orchestrator';

vi.mock('#/core/Orchestrator', () => ({
  orchestrator: {
    sendToMachine: vi.fn()
  }
}));

describe('reservationUtils', () => {
  describe('splitSubcategory', () => {
    it('should return empty array for null or undefined', () => {
      expect(splitSubcategory(null)).toEqual([]);
      expect(splitSubcategory(undefined)).toEqual([]);
    });

    it('should return empty array for empty string', () => {
      expect(splitSubcategory('')).toEqual([]);
    });

    it('should split by various separators', () => {
      expect(splitSubcategory('a, b; c| d/ e\\ f')).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
      expect(splitSubcategory('a - b – c — d')).toEqual(['a', 'b', 'c', 'd']);
    });

    it('should trim whitespace and filter empty parts', () => {
      expect(splitSubcategory('  a  ,  , b  ')).toEqual(['a', 'b']);
      expect(splitSubcategory('a,,b')).toEqual(['a', 'b']);
    });

    it('should handle single value', () => {
      expect(splitSubcategory('single')).toEqual(['single']);
    });
  });

  describe('buildAvailableSubcats', () => {
    it('should return empty array for empty snapshot', () => {
      expect(buildAvailableSubcats({})).toEqual([]);
      expect(buildAvailableSubcats()).toEqual([]);
    });

    it('should build unique sorted subcategories from snapshot', () => {
      const snapshot = {
        doc1: [
          { subcategory: 'a, b', count: 1 },
          { subcategory: 'c', count: 2 }
        ],
        doc2: [
          { subcategory: 'b, d', count: 1 },
          { subcategory: null, count: 1 }
        ]
      };

      expect(buildAvailableSubcats(snapshot)).toEqual(['a', 'b', 'c', 'd']);
    });

    it('should handle null subcategories', () => {
      const snapshot = {
        doc1: [
          { subcategory: null, count: 1 },
          { subcategory: 'a', count: 1 }
        ]
      };

      expect(buildAvailableSubcats(snapshot)).toEqual(['a']);
    });
  });

  describe('buildDoctorSubcatMap', () => {
    it('should return empty object for empty snapshot', () => {
      expect(buildDoctorSubcatMap({})).toEqual({});
      expect(buildDoctorSubcatMap()).toEqual({});
    });

    it('should build map of doctor to unique subcategories', () => {
      const snapshot = {
        doc1: [
          { subcategory: 'a, b', count: 1 },
          { subcategory: 'a, c', count: 2 }
        ],
        doc2: [
          { subcategory: 'b, d', count: 1 }
        ]
      };

      const expected = {
        doc1: ['a', 'b', 'c'],
        doc2: ['b', 'd']
      };

      expect(buildDoctorSubcatMap(snapshot)).toEqual(expected);
    });

    it('should handle doctors with no subcategories', () => {
      const snapshot = {
        doc1: [
          { subcategory: null, count: 1 }
        ],
        doc2: [
          { subcategory: 'a', count: 1 }
        ]
      };

      const expected = {
        doc1: [],
        doc2: ['a']
      };

      expect(buildDoctorSubcatMap(snapshot)).toEqual(expected);
    });
  });

  describe('buildFilteredDoctors', () => {
    const doctors = [
      { id: '1', score: 4.5, specialty: 'cardiology' },
      { id: '2', score: 3.0, specialty: 'cardiology' },
      { id: '3', score: null, specialty: 'cardiology' }
    ];

    it('should return all doctors when no filters', () => {
      expect(buildFilteredDoctors(doctors, {}, null, [])).toEqual(doctors);
    });

    it('should filter by minimum score', () => {
      expect(buildFilteredDoctors(doctors, {}, 4.0, [])).toEqual([
        { id: '1', score: 4.5, specialty: 'cardiology' }
      ]);
    });

    it('should filter by selected subcategories', () => {
      const doctorSubcatMap = {
        '1': ['friendly', 'punctual'],
        '2': ['friendly'],
        '3': []
      };

      expect(buildFilteredDoctors(doctors, doctorSubcatMap, null, ['punctual'])).toEqual([
        { id: '1', score: 4.5, specialty: 'cardiology' }
      ]);
    });

    it('should combine score and subcategory filters', () => {
      const doctorSubcatMap = {
        '1': ['friendly', 'punctual'],
        '2': ['friendly'],
        '3': ['punctual']
      };

      expect(buildFilteredDoctors(doctors, doctorSubcatMap, 3.5, ['friendly'])).toEqual([
        { id: '1', score: 4.5, specialty: 'cardiology' }
      ]);
    });

    it('should handle empty doctors array', () => {
      expect(buildFilteredDoctors([], {}, null, [])).toEqual([]);
    });

    it('should handle non-array doctors input', () => {
      expect(buildFilteredDoctors(null as any, {}, null, [])).toEqual([]);
    });
  });

  describe('requestRatedCountsForDoctors', () => {
    it('should not send request when doctors array is empty', () => {
      requestRatedCountsForDoctors([]);
      expect(orchestrator.sendToMachine).not.toHaveBeenCalled();

      requestRatedCountsForDoctors();
      expect(orchestrator.sendToMachine).not.toHaveBeenCalled();
    });

    it('should send request with doctor ids', () => {
      const doctors = [
        { id: 'doc1' },
        { id: 'doc2' },
        { id: null },
        { id: 'doc3' }
      ];

      requestRatedCountsForDoctors(doctors);

      expect(orchestrator.sendToMachine).toHaveBeenCalledWith(
        'data',
        {
          type: 'LOAD_RATED_SUBCATEGORY_COUNTS',
          doctorIds: ['doc1', 'doc2', 'doc3']
        }
      );
    });

    it('should filter out null/undefined ids', () => {
      const doctors = [
        { id: 'doc1' },
        { id: null },
        { id: undefined },
        {}
      ];

      requestRatedCountsForDoctors(doctors);

      expect(orchestrator.sendToMachine).toHaveBeenCalledWith(
        'data',
        {
          type: 'LOAD_RATED_SUBCATEGORY_COUNTS',
          doctorIds: ['doc1']
        }
      );
    });
  });
});