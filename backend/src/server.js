/**
 * backend/src/server.js
 * Express Enterprise Server Entrypoint.
 */
const app = require('./app');
const config = require('./config');

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`
======================================================
🏥 DOCTORS VEDIKA - ENTERPRISE BACKEND API SERVICE 🏥
======================================================
[Status]      Running
[Port]        ${PORT}
[Environment] ${config.env}
[API Gateway] http://localhost:${PORT}/api/v1
[Health]      http://localhost:${PORT}/health
======================================================
  `);
});

process.on('unhandledRejection', (err) => {
  console.error('[Unhandled Rejection]', err);
  server.close(() => process.exit(1));
});
