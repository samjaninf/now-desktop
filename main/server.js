// Native
const { createServer } = require('http');
const path = require('path');

// Packages
const { app } = require('electron');
const next = require('next');

const prepareServer = nextHandler =>
  createServer((req, res) => {
    if (req.headers['user-agent'].indexOf('Electron') === -1) {
      res.writeHead(404);
      res.end();

      return;
    }

    res.setHeader('Access-Control-Request-Method', 'GET');

    if (req.method !== 'GET') {
      res.writeHead(405);
      res.end('Method Not Allowed');
      return;
    }

    return nextHandler(req, res);
  });

module.exports = () =>
  new Promise(async (resolve, reject) => {
    const dev = process.env.NODE_ENV !== 'production';
    const nextApp = next({ dev, dir: path.resolve('./renderer') });
    const nextHandler = nextApp.getRequestHandler();

    await nextApp.prepare();
    const server = prepareServer(nextHandler);

    server.listen(5000, error => {
      if (error) {
        reject(error);
        return;
      }

      app.on('quit', () => server.close());
      resolve(server);
    });
  });