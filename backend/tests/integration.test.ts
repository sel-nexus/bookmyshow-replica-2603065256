import { afterEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { getConfig } from '../src/config';

const handles: ReturnType<typeof createApp>[] = [];

afterEach(() => handles.splice(0).forEach((handle) => handle.close()));

describe('authentication, catalog, and booking integration', () => {
  it('chains authentication, protected catalog lookup, and persisted booking', async () => {
    const handle = createApp(getConfig({ databasePath: ':memory:', jwtSecret: 'test-secret-that-is-long-enough' }));
    handles.push(handle);
    const api = handle.app;
    const login = await request(api).post('/api/auth/verify').send({ mobileNumber: '9876543210', otp: '1234' });
    expect(login.status).toBe(200);
    const authorization = `Bearer ${login.body.token}`;

    const movies = await request(api).get('/api/movies').set('authorization', authorization);
    expect(movies.status).toBe(200);
    const movie = movies.body[0] as { id: number };
    const theatres = await request(api).get(`/api/theatres?movieId=${movie.id}`).set('authorization', authorization);
    expect(theatres.status).toBe(200);
    const theatre = theatres.body[0] as { id: number; name: string };

    const booking = await request(api).post('/api/bookings').set('authorization', authorization).send({ movieId: movie.id, theatreId: theatre.id, seats: ['A1', 'A2', 'A3'], paymentMethod: 'card', totalPrice: 450 });
    expect(booking.status).toBe(201);
    expect(booking.body.theatre.name).toBe(theatre.name);
    expect(handle.database.prepare('SELECT user_id, movie_id, theatre_id, seats, payment_method, total_price FROM bookings WHERE id = ?').get(booking.body.id)).toEqual({ user_id: login.body.user.id, movie_id: movie.id, theatre_id: theatre.id, seats: 'A1,A2,A3', payment_method: 'card', total_price: 450 });
  });

  it('stops a negative chain at catalog authentication and booking reference validation', async () => {
    const handle = createApp(getConfig({ databasePath: ':memory:', jwtSecret: 'test-secret-that-is-long-enough' }));
    handles.push(handle);
    const api = handle.app;
    const unauthenticatedCatalog = await request(api).get('/api/movies');
    expect(unauthenticatedCatalog.status).toBe(401);

    const login = await request(api).post('/api/auth/verify').send({ mobileNumber: '9876543210', otp: '1234' });
    expect(login.status).toBe(200);
    const failedBooking = await request(api).post('/api/bookings').set('authorization', `Bearer ${login.body.token}`).send({ movieId: 999, theatreId: 1, seats: ['A1', 'A2', 'A3'], paymentMethod: 'card', totalPrice: 450 });

    expect(failedBooking.status).toBe(404);
    expect(handle.database.prepare('SELECT COUNT(*) AS count FROM bookings').get()).toEqual({ count: 0 });
  });
});
