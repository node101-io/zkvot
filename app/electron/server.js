import autoUpdater from 'update-electron-app';
import electron from 'electron';
import express from 'express';
import next from 'next';
import setupTrayMenu from './utils/setupTrayMenu.js';
import indexRouteController from './routes/indexRouteController.js';
const { app } = electron;

const DEV = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 10102;

const nextApp = next({ dev: DEV });
const handle = nextApp.getRequestHandler();

const server = express();

server.use('/', indexRouteController);
server.all('*', (req, res) => handle(req, res));

if (!app.requestSingleInstanceLock())
  app.quit();

app.dock.hide();

autoUpdater.updateElectronApp({
  repo: 'node101-io/zkvot',
});

app.on('ready', () => {
  nextApp.prepare()
    .then(() => {
      server.listen(PORT, () => {
        setupTrayMenu();

        console.log(`> Ready on http://localhost:${PORT}`);
      });
    });
});
app.on('error', () => app.quit());
