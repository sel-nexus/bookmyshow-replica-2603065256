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

const validBooking = { movieId: 1, theatreId: 1, seats: ['A1', 'A2', 'A3'], paymentMethod: 'upi', totalPrice: 450 };

afterEach(() => handles.splice(0).forEach((handle) => handle.close()));

describe('booking API', () => {
  it('persists a valid authenticated booking', async () => {
    const handle = createApp(getConfig({ databasePath: ':memory:', jwtSecret: 'test-secret-that-is-long-enough' }));
    handles.push(handle);
    const api = handle.app;
    const response = await request(api).post('/api/bookings').set('authorization', `Bearer ${await token(api)}`).send(validBooking);

    expect(response.status).toBe(201);
    expect(response.body.id).toEqual(expect.any(Number));
    expect(response.body.movie.title).toBe('Paradise');

    const persistedBooking = handle.database.prepare(`
      SELECT b.user_id, b.movie_id, b.theatre_id, b.seats, b.payment_method, b.total_price,
             u.mobile_number AS user_mobile_number, m.title AS movie_title, t.name AS theatre_name
      FROM bookings b
      JOIN users u ON u.id = b.user_id
      JOIN movies m ON m.id = b.movie_id
      JOIN theatres t ON t.id = b.theatre_id
      WHERE b.id = ?
    `).get(response.body.id);
    expect(persistedBooking).toEqual({
      user_id: expect.any(Number),
      movie_id: validBooking.movieId,
      theatre_id: validBooking.theatreId,
      seats: 'A1,A2,A3',
      payment_method: validBooking.paymentMethod,
      total_price: validBooking.totalPrice,
      user_mobile_number: '9876543210',
      movie_title: 'Paradise',
      theatre_name: 'Sandhya 70mm'
    });
    expect(handle.database.prepare('PRAGMA foreign_key_check').all()).toEqual([]);
    expect(handle.database.prepare('PRAGMA table_info(bookings)').all()).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'user_id', notnull: 1 }),
      expect.objectContaining({ name: 'movie_id', notnull: 1 }),
      expect.objectContaining({ name: 'theatre_id', notnull: 1 }),
      expect.objectContaining({ name: 'seats', notnull: 1 }),
      expect.objectContaining({ name: 'payment_method', notnull: 1 }),
      expect.objectContaining({ name: 'total_price', notnull: 1 })
    ]));
  });

  it('rejects missing and malformed bearer credentials', async () => {
    const api = app();
    const missing = await request(api).post('/api/bookings').send(validBooking);
    const malformed = await request(api).post('/api/bookings').set('authorization', 'Basic credentials').send(validBooking);

    expect(missing.status).toBe(401);
    expect(malformed.status).toBe(401);
  });

  it('rejects missing or invalid booking fields and payment methods', async () => {
    const api = app();
    const authorization = `Bearer ${await token(api)}`;
    const missingMovie = await request(api).post('/api/bookings').set('authorization', authorization).send({ ...validBooking, movieId: undefined });
    const invalidSeats = await request(api).post('/api/bookings').set('authorization', authorization).send({ ...validBooking, seats: [] });
    const invalidPayment = await request(api).post('/api/bookings').set('authorization', authorization).send({ ...validBooking, paymentMethod: 'cash' });
    const invalidPrice = await request(api).post('/api/bookings').set('authorization', authorization).send({ ...validBooking, totalPrice: '450' });

    expect(missingMovie.status).toBe(400);
    expect(invalidSeats.status).toBe(400);
    expect(invalidPayment.status).toBe(400);
    expect(invalidPrice.status).toBe(400);
  });

  it('returns 404 for unknown movie and theatre booking references', async () => {
    const api = app();
    const authorization = `Bearer ${await token(api)}`;
    const unknownMovie = await request(api).post('/api/bookings').set('authorization', authorization).send({ ...validBooking, movieId: 999 });
    const unknownTheatre = await request(api).post('/api/bookings').set('authorization', authorization).send({ ...validBooking, theatreId: 999 });

    expect(unknownMovie.status).toBe(404);
    expect(unknownTheatre.status).toBe(404);
  });

  it('rejects an invalid demo seat booking', async () => {
    const api = app();
    const response = await request(api).post('/api/bookings').set('authorization', `Bearer ${await token(api)}`).send({ ...validBooking, seats: ['B1'], totalPrice: 150 });

    expect(response.status).toBe(400);
  });
});
