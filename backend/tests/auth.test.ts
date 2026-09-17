import { afterEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { getConfig } from '../src/config';

const handles: ReturnType<typeof createApp>[] = [];

function app() {
  const handle = createApp(getConfig({ databasePath: ':memory:', jwtSecret: 'test-secret-that-is-long-enough' }));
  handles.push(handle);
  return handle;
}

afterEach(() => handles.splice(0).forEach((handle) => handle.close()));

describe('OTP authentication API', () => {
  it('starts a challenge for a valid mobile number', async () => {
    const response = await request(app().app).post('/api/auth/login').send({ mobileNumber: '9876543210' });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'OTP sent' });
  });

  it('rejects malformed mobile login input', async () => {
    const response = await request(app().app).post('/api/auth/login').send({ mobileNumber: 'bad' });
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('10 digits');
  });

  it('issues a session token for the demo OTP and persists the user', async () => {
    const response = await request(app().app).post('/api/auth/verify').send({ mobileNumber: '9876543210', otp: '1234' });
    expect(response.status).toBe(200);
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.user.mobileNumber).toBe('9876543210');
  });

  it('keeps repeated OTP verification idempotent with one user record', async () => {
    const handle = app();
    const first = await request(handle.app).post('/api/auth/verify').send({ mobileNumber: '9876543210', otp: '1234' });
    const second = await request(handle.app).post('/api/auth/verify').send({ mobileNumber: '9876543210', otp: '1234' });

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(second.body.user.id).toBe(first.body.user.id);
    expect(handle.database.prepare('SELECT COUNT(*) AS count FROM users WHERE mobile_number = ?').get('9876543210')).toEqual({ count: 1 });
  });

  it('rejects an incorrect OTP', async () => {
    const response = await request(app().app).post('/api/auth/verify').send({ mobileNumber: '9876543210', otp: '9999' });
    expect(response.status).toBe(401);
    expect(response.body.error).toContain('invalid');
  });
});
