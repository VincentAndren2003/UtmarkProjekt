import { describe, expect, test, vi } from 'vitest';
import { gatewayAuthMiddleware } from './gatewayAuthMiddleware';

function mockReq(headers: Record<string, string | undefined> = {}) {
  return {
    header: (name: string) => headers[name.toLowerCase()] ?? headers[name],
  } as Parameters<typeof gatewayAuthMiddleware>[0];
}

describe('gatewayAuthMiddleware', () => {
  test('returnerar 401 utan x-user-id', () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    gatewayAuthMiddleware(mockReq(), res as never, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('sätter userId och anropar next', () => {
    const req = mockReq({ 'x-user-id': 'user-123' });
    const res = { status: vi.fn(), json: vi.fn() };
    const next = vi.fn();

    gatewayAuthMiddleware(req, res as never, next);

    expect(req.userId).toBe('user-123');
    expect(next).toHaveBeenCalled();
  });
});
