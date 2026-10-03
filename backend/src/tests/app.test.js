import assert from 'node:assert/strict';
import test from 'node:test';
import request from 'supertest';
import app from '../app.js';
import { cleanValue } from '../middleware/sanitize.js';

test('GET /api/health répond sans exposer Express', async () => {
  const response = await request(app).get('/api/health');
  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.headers['x-powered-by'], undefined);
  assert.ok(response.headers['x-content-type-options']);
});

test('le nettoyage retire le HTML et les clés NoSQL dangereuses', () => {
  const payload = { title: '<script>alert(1)</script>Incident', $where: 'danger', nested: { 'a.b': true } };
  cleanValue(payload);
  assert.equal(payload.title, 'Incident');
  assert.equal(payload.$where, undefined);
  assert.equal(payload.nested['a.b'], undefined);
});

test('une route privée refuse une requête sans session', async () => {
  const response = await request(app).get('/api/tickets');
  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test('la validation refuse une adresse e-mail invalide avant accès à la base', async () => {
  const response = await request(app).post('/api/auth/login').send({ email: 'invalide', password: 'test' });
  assert.equal(response.status, 400);
  assert.ok(Array.isArray(response.body.errors));
});

test('la protection CSRF bloque une mutation avec un cookie de session sans jeton', async () => {
  const response = await request(app).post('/api/tickets').set('Cookie', ['token=faux-token']).send({});
  assert.equal(response.status, 403);
  assert.equal(response.body.message, 'Jeton CSRF invalide.');
});
