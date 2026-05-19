// tests/generateRoute.test.ts
import request from 'supertest';
import express from 'express';
import routeRouter from '../routes/routeRouter';
import { Route } from '../models/Route';
import { GreenAreaService } from '../services/GreenAreaService';
import {
  describe,
  test,
  expect,
  vi,
  beforeEach,
  afterEach,
  MockInstance,
} from 'vitest';

vi.mock('../models/Route');
vi.mock('../services/GreenAreaService');

const app = express();
app.use(express.json());
app.use(routeRouter);

describe('POST /generate-route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (GreenAreaService as unknown as MockInstance).mockImplementation(() => ({
      fetchGreenAreas: vi.fn().mockResolvedValue([]),
    }));
  });

  afterEach((context) => {
    // ← Lägg till detta
    if (context.task.result?.state === 'pass') {
      console.log(`PASSED: ${context.task.name}`);
    } else {
      console.log(`FAILED: ${context.task.name}`);
    }
  });

  test('ska returnera 200 med korrekt data', async () => {
    (Route as unknown as MockInstance).mockImplementation(() => ({
      id: 1,
      start: 'Stockholm',
      distance: 10,
      setCheckpoints: () => ['point1', 'point2'],
    }));

    const res = await request(app)
      .post('/generate-route')
      .send({ id: 1, start: 'Stockholm', distance: 10, filters: ['park'] });

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
    expect(res.body.checkpoints).toEqual(['point1', 'point2']);
    expect(res.body.filters).toEqual(['park']);
  });

  test('ska returnera 500 om route kastar ett fel', async () => {
    (Route as unknown as MockInstance).mockImplementation(() => {
      throw new Error('Något gick fel');
    });

    const res = await request(app)
      .post('/generate-route')
      .send({ id: 1, start: 'Stockholm', distance: 10 });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Rutt kunde inte genereras');
  });

  test('ska clampas distance till 30 om för högt värde skickas', async () => {
    (Route as unknown as MockInstance).mockImplementation(
      (id, start, distance) => ({
        id,
        start,
        distance,
        setCheckpoints: () => [],
      })
    );

    const res = await request(app)
      .post('/generate-route')
      .send({ id: 1, start: 'Stockholm', distance: 999 })
      .timeout(30000);

    expect(res.status).toBe(200);
    expect(res.body.distance).toBe(30);
  }, 10000);
});
