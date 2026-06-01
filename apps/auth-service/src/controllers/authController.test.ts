import { describe, expect, test, vi, beforeEach } from 'vitest';
import { signup, login } from './authController';
import { User } from '../models/User';

vi.mock('../models/User', () => ({
  User: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed-password'),
    compare: vi.fn(),
  },
}));

vi.mock('../utils/jwt', () => ({
  signToken: vi.fn(() => 'test-jwt-token'),
}));

function mockRes() {
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
  return res;
}

describe('signup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('returnerar 400 om email eller password saknas', async () => {
    const res = mockRes();
    const next = vi.fn();

    await signup({ body: { email: 'a@test.com' } } as never, res as never, next);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Email and password are required' });
  });

  test('returnerar 409 om email redan finns', async () => {
    vi.mocked(User.findOne).mockResolvedValue({ id: '1' } as never);
    const res = mockRes();
    const next = vi.fn();

    await signup(
      { body: { email: 'Taken@Test.com', password: 'secret' } } as never,
      res as never,
      next
    );

    expect(User.findOne).toHaveBeenCalledWith({ email: 'taken@test.com' });
    expect(res.statusCode).toBe(409);
  });

  test('returnerar 201 och token vid lyckad registrering', async () => {
    vi.mocked(User.findOne).mockResolvedValue(null);
    vi.mocked(User.create).mockResolvedValue({
      id: 'user-1',
      email: 'new@test.com',
    } as never);

    const res = mockRes();
    const next = vi.fn();

    await signup(
      { body: { email: 'new@test.com', password: 'secret' } } as never,
      res as never,
      next
    );

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      token: 'test-jwt-token',
      user: { id: 'user-1', email: 'new@test.com' },
    });
  });
});

describe('login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('returnerar 401 om användaren inte finns', async () => {
    vi.mocked(User.findOne).mockResolvedValue(null);
    const res = mockRes();
    const next = vi.fn();

    await login(
      { body: { email: 'x@test.com', password: 'pw' } } as never,
      res as never,
      next
    );

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'Invalid credentials' });
  });
});
