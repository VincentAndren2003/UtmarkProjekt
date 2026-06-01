import { describe, expect, test } from 'vitest';
import {
  normalizeTrackPoints,
  parseFinishStatus,
  parseRunStatus,
  MAX_TRACK_POINTS,
} from './runValidation';

describe('parseFinishStatus', () => {
  test('defaultar till completed', () => {
    expect(parseFinishStatus(undefined)).toBe('completed');
    expect(parseFinishStatus('completed')).toBe('completed');
  });

  test('accepterar abandoned', () => {
    expect(parseFinishStatus('abandoned')).toBe('abandoned');
  });

  test('kastar vid ogiltig status', () => {
    expect(() => parseFinishStatus('in_progress')).toThrow('Ogiltig status');
  });
});

describe('parseRunStatus', () => {
  test('returnerar undefined för tom input', () => {
    expect(parseRunStatus(undefined)).toBeUndefined();
    expect(parseRunStatus('')).toBeUndefined();
  });

  test('accepterar giltiga statusar', () => {
    expect(parseRunStatus('completed')).toBe('completed');
    expect(parseRunStatus('in_progress')).toBe('in_progress');
  });

  test('kastar vid ogiltig status', () => {
    expect(() => parseRunStatus('paused')).toThrow('Ogiltig status');
  });
});

describe('normalizeTrackPoints', () => {
  test('returnerar tom array utan input', () => {
    expect(normalizeTrackPoints(undefined)).toEqual([]);
  });

  test('kopierar giltiga punkter', () => {
    const points = [{ lat: 59.3, long: 18.0, timeStamp: 1 }];
    expect(normalizeTrackPoints(points)).toEqual(points);
  });

  test('kastar om för många trackPoints', () => {
    const tooMany = Array.from({ length: MAX_TRACK_POINTS + 1 }, (_, i) => ({
      lat: 59,
      long: 18,
      timeStamp: i,
    }));
    expect(() => normalizeTrackPoints(tooMany)).toThrow('trackPoints');
  });
});
