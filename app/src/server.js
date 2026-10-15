const express = require('express');

const app = express();

const APP_NAME = process.env.APP_NAME || 'deployment-platform-demo';
const APP_VERSION = process.env.APP_VERSION || '1.0.0';
const ENVIRONMENT = process.env.ENVIRONMENT || 'local';

const metrics = {
  requestsTotal: 0,
  requestsByStatus: new Map()
};

app.use((req, res, next) => {
  // Do not count Prometheus scraping its own metrics endpoint.
  if (req.path === '/metrics') {
    return next();
  }

  metrics.requestsTotal += 1;

  res.on('finish', () => {
    const status = res.statusCode;
    const currentCount = metrics.requestsByStatus.get(status) || 0;

    metrics.requestsByStatus.set(status, currentCount + 1);
  });

  next();
});

app.get('/', (req, res) => {
  res.json({
    application: APP_NAME,
    version: APP_VERSION,
    environment: ENVIRONMENT,
    message: `Cloud deployment platform v${APP_VERSION} is running!`
  });
});

app.get('/version', (req, res) => {
  res.json({
    application: APP_NAME,
    version: APP_VERSION,
    environment: ENVIRONMENT
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.get('/ready', (req, res) => {
  res.status(200).json({ status: 'ready' });
});

app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.get('/readyz', (req, res) => {
  res.status(200).json({ status: 'ready' });
});

app.get('/metrics', (req, res) => {
  const lines = [
    '# HELP http_requests_total Total HTTP requests handled by the application.',
    '# TYPE http_requests_total counter',
    `http_requests_total ${metrics.requestsTotal}`,
    '# HELP http_requests_by_status_total HTTP responses grouped by status code.',
    '# TYPE http_requests_by_status_total counter'
  ];

  for (const [status, count] of metrics.requestsByStatus) {
    lines.push(`http_requests_by_status_total{status="${status}"} ${count}`);
  }

  lines.push(
    '# HELP process_uptime_seconds Application process uptime in seconds.',
    '# TYPE process_uptime_seconds gauge',
    `process_uptime_seconds ${process.uptime().toFixed(2)}`
  );

  res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
  res.status(200).send(`${lines.join('\n')}\n`);
});

if (require.main === module) {
  const port = Number(process.env.PORT) || 8080;

  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Application listening on port ${port}`);
  });

  let shuttingDown = false;

  function shutdown(signal) {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    console.log(`${signal} received. Starting graceful shutdown.`);

    server.close((error) => {
      if (error) {
        console.error('Error during server shutdown:', error);
        process.exitCode = 1;
        return;
      }

      console.log('Server closed. Existing requests have finished.');
    });

    // Allow time for active requests to finish, but don't wait forever.
    const forceExitTimer = setTimeout(() => {
      console.error('Graceful shutdown timed out.');
      server.closeAllConnections();
      process.exit(1);
    }, 25000);

    forceExitTimer.unref();
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

module.exports = app;
