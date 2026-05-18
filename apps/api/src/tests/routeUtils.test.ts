import { describe, test, expect } from 'vitest';
import { normalizeDistance, normalizeFilters } from '../utils/routeUtils';

describe('normalizeDistance', () => {
  test('ska returnera 1 om värdet är under minimum', () => {
    expect(normalizeDistance(0)).toBe(1);
    expect(normalizeDistance(-5)).toBe(1);
  });

  test('ska returnera 30 om värdet är över maximum', () => {
    expect(normalizeDistance(50)).toBe(30);
    expect(normalizeDistance(100)).toBe(30);
  });

  test('ska returnera värdet om det är inom 1-30', () => {
    expect(normalizeDistance(15)).toBe(15);
    expect(normalizeDistance(1)).toBe(1);
    expect(normalizeDistance(30)).toBe(30);
  });

  test('ska returnera 1 om värdet inte är ett nummer', () => {
    expect(normalizeDistance('abc')).toBe(1);
    expect(normalizeDistance(null)).toBe(1);
    expect(normalizeDistance(undefined)).toBe(1);
  });
});

describe('normalizeFilters', () => {
  test('ska returnera bara strängar', () => {
    expect(normalizeFilters(['park', 'water'])).toEqual(['park', 'water']);
    expect(normalizeFilters([1, 'park', null, 'water'])).toEqual([
      'park',
      'water',
    ]);
  });

  test('ska returnera tom array om input inte är en array', () => {
    expect(normalizeFilters('not-an-array')).toEqual([]);
    expect(normalizeFilters(null)).toEqual([]);
  });

  test('ska returnera tom array om input är tom', () => {
    expect(normalizeFilters([])).toEqual([]);
  });
});
