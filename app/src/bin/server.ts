#!/usr/bin/env node
import http, { type RequestListener } from 'http';
import { app, main } from '../app';


const DEFAULT_PORT = 3000;

const normalizePort = (val: string | undefined): number => {
  if (val == null) return DEFAULT_PORT;
  
  const port = parseInt(val, 10);
  
  if (isNaN(port) || port < 0) {
    return DEFAULT_PORT;
  }
  
  return port;
};

const port: number = normalizePort(process.env.PORT ?? '3000');
app.set('port', port);
const server = http.createServer(app as RequestListener);

interface ServerError extends Error{
  syscall?: string,
  code?: string,
}
server.on('error', (error: ServerError) => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const bind = `Port ${port}`;
  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});
server.on('listening', () => {
  const addr = server.address();
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr?.port}`;
  console.log(`Listening on ${bind}`);
});

void (async () => {
  server.listen(port);
  await main();
})();
