import request from 'supertest';
import app from '../index';

describe('Server Health', () => {
  it('should respond to health check', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('environment');
  });

  it('should respond to readiness check', async () => {
    const response = await request(app)
      .get('/api/ready')
      .expect(200); // Should be 200 because env vars are set in .env

    expect(response.body).toHaveProperty('status', 'ready');
    expect(response.body).toHaveProperty('services');
  });

  it('should return API info on root', async () => {
    const response = await request(app)
      .get('/api/')
      .expect(200);

    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('version');
    expect(response.body).toHaveProperty('endpoints');
  });

  it('should return 404 for unknown endpoints', async () => {
    const response = await request(app)
      .get('/api/unknown')
      .expect(404);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error', 'Endpoint not found');
  });
});