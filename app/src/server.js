const express = require('express');

const app = express();

const APP_NAME = process.env.APP_NAME || 'deployment-platform-demo';
const APP_VERSION = process.env.APP_VERSION || '1.0.0';
const ENVIRONMENT = process.env.ENVIRONMENT || 'local';

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

if (require.main === module) {
  const port = Number(process.env.PORT) || 8080;

  app.listen(port, '0.0.0.0', () => {
    console.log(`Application listening on port ${port}`);
  });
}

module.exports = app;
