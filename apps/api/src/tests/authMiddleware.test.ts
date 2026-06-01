import { describe, expect, test, vi, beforeEach } from 'vitest';
import { authMiddleware } from '../middleware/authMiddleware';
import { signToken } from '../utils/jwt';

describe('authMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('returnerar 401 utan Authorization-header', () => {
    const req = { headers: {} } as Parameters<typeof authMiddleware>[0];
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    authMiddleware(req, res as never, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('returnerar 401 vid ogiltig token', () => {
    const req = {
      headers: { authorization: 'Bearer not-a-valid-token' },
    } as Parameters<typeof authMiddleware>[0];
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    authMiddleware(req, res as never, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('sätter userId och anropar next vid giltig token', () => {
    const token = signToken({ userId: 'user-abc' });
    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as Parameters<typeof authMiddleware>[0];
    const res = { status: vi.fn(), json: vi.fn() };
    const next = vi.fn();

    authMiddleware(req, res as never, next);

    expect(req.userId).toBe('user-abc');
    expect(next).toHaveBeenCalled();
  });
});
