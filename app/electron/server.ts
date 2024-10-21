import autoUpdater from 'update-electron-app';
import electron from 'electron';
import express from 'express';
import next from 'next';
import setupTrayMenu from './utils/setupTrayMenu.js';
import indexRouteController from './routes/indexRoute.js';

const { app } = electron;

const DEV = !app.isPackaged;
const PORT = Number(process.env.PORT) || 10101;

const nextApp = next({
  dev: DEV,
  dir: DEV ? './' : app.getAppPath(),
});
const handle = nextApp.getRequestHandler();

const server = express();
server.use(express.json());

server.use('/', indexRouteController);
server.all('*', (req, res) => handle(req, res));

if (!app.requestSingleInstanceLock()) app.quit();

app.dock.hide();

autoUpdater.updateElectronApp({
  repo: 'node101-io/zkvot',
});

app.on('ready', () => {
  nextApp.prepare().then(() => {
    server.listen(PORT, () => {
      setupTrayMenu(PORT);

      console.log(`> Ready on http://localhost:${PORT}`);
    });
  });
});
