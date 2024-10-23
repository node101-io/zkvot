import { Worker } from 'worker_threads';
import autoUpdater from 'update-electron-app';
import { app } from 'electron';
import express from 'express';
import setupTrayMenu from './utils/setupTrayMenu.js';
import indexRouteController from './routes/indexRoute.js';
import { compileVoteProgram } from './utils/compileZkPrograms.js';

const DEV = !app.isPackaged;
const PORT_FRONTEND = 10101;
const PORT_BACKEND = 10102;

const server = express();

server.use(express.json());
server.use('/', indexRouteController);

if (!app.requestSingleInstanceLock()) app.quit();

app.dock.hide();

autoUpdater.updateElectronApp({ repo: 'node101-io/zkvot' });

app.on('ready', () => {
  server.listen(PORT_BACKEND, async () => {
    setupTrayMenu(PORT_BACKEND);

    console.log(`> local backend - http://localhost:${PORT_BACKEND}`);

    new Worker(new URL('./utils/startFrontend.js', import.meta.url), { env: {
      DEV: DEV ? 'true' : 'false',
      NEXT_APP_DIR: DEV ? './' : app.getAppPath(),
      PORT: PORT_FRONTEND.toString()
    }})
      .on('message', console.log)
      .on('error', console.error)
      .on('exit', console.error);

    await compileVoteProgram();
  });
});
