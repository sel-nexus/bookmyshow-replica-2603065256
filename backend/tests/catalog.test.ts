import { afterEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { getConfig } from '../src/config';

const handles: ReturnType<typeof createApp>[] = [];

function app() {
  const handle = createApp(getConfig({ databasePath: ':memory:', jwtSecret: 'test-secret-that-is-long-enough' }));
  handles.push(handle);
  return handle.app;
}

async function token(api: ReturnType<typeof app>): Promise<string> {
  const response = await request(api).post('/api/auth/verify').send({ mobileNumber: '9876543210', otp: '1234' });
  expect(response.status).toBe(200);
  return response.body.token;
}

afterEach(() => handles.splice(0).forEach((handle) => handle.close()));

describe('catalog', () => {
  it('requires bearer credentials for movies and theatres', async () => {
    const api = app();
    const missingMovies = await request(api).get('/api/movies');
    const malformedMovies = await request(api).get('/api/movies').set('authorization', 'Token malformed');
    const missingTheatres = await request(api).get('/api/theatres?movieId=1');
    const malformedTheatres = await request(api).get('/api/theatres?movieId=1').set('authorization', 'Bearer not-a-jwt');

    expect(missingMovies.status).toBe(401);
    expect(malformedMovies.status).toBe(401);
    expect(missingTheatres.status).toBe(401);
    expect(malformedTheatres.status).toBe(401);
  });

  it('returns seeded movies with a valid bearer token', async () => {
    const api = app();
    const response = await request(api).get('/api/movies').set('authorization', `Bearer ${await token(api)}`);

    expect(response.status).toBe(200);
    expect(response.body.map((movie: { title: string }) => movie.title)).toEqual(['Paradise', 'Bloody Romeo', 'OG2']);
  });

  it('returns mapped theatres and rejects invalid, injection-like, and unknown movie ids', async () => {
    const api = app();
    const authorization = `Bearer ${await token(api)}`;
    const valid = await request(api).get('/api/theatres?movieId=1').set('authorization', authorization);
    const invalid = await request(api).get('/api/theatres?movieId=no').set('authorization', authorization);
    const injection = await request(api).get('/api/theatres?movieId=1%20OR%201=1').set('authorization', authorization);
    const unknown = await request(api).get('/api/theatres?movieId=999').set('authorization', authorization);

    expect(valid.status).toBe(200);
    expect(valid.body).toHaveLength(3);
    expect(invalid.status).toBe(400);
    expect(injection.status).toBe(400);
    expect(unknown.status).toBe(404);
  });
});
