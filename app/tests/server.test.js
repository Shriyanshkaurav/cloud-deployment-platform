const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('node:http');

process.env.APP_NAME = 'deployment-platform-demo';
process.env.APP_VERSION = '1.1.0';
process.env.ENVIRONMENT = 'test';

const app = require('../src/server');
const server = createServer(app);

let baseUrl;

test('start test server', async () => {
  await new Promise((resolve, reject) => {
    server.once('error', reject);

    server.listen(0, '127.0.0.1', () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
});

after(async () => {
  if (server.listening) {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
});

test('GET / returns application information', async () => {
  const response = await fetch(`${baseUrl}/`);
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.equal(data.application, 'deployment-platform-demo');
  assert.equal(data.version, '1.1.0');
  assert.equal(data.environment, 'test');
});

test('GET /health returns healthy', async () => {
  const response = await fetch(`${baseUrl}/health`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'healthy' });
});

test('GET /ready returns ready', async () => {
  const response = await fetch(`${baseUrl}/ready`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ready' });
});

test('GET /healthz returns healthy', async () => {
  const response = await fetch(`${baseUrl}/healthz`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'healthy' });
});

test('GET /readyz returns ready', async () => {
  const response = await fetch(`${baseUrl}/readyz`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ready' });
});

test('GET /version returns application version information', async () => {
  const response = await fetch(`${baseUrl}/version`);
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(data, {
    application: 'deployment-platform-demo',
    version: '1.1.0',
    environment: 'test'
  });
});

test('GET /metrics returns Prometheus-compatible metrics', async () => {
  const response = await fetch(`${baseUrl}/metrics`);
  const body = await response.text();

  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /text\/plain/);
  assert.match(body, /# TYPE http_requests_total counter/);
  assert.match(body, /http_requests_total \d+/);
  assert.match(body, /# TYPE process_uptime_seconds gauge/);
  assert.match(body, /process_uptime_seconds \d+\.\d+/);
});