import autoUpdater from 'update-electron-app';
import electron from 'electron';
import express, { Request, Response } from 'express';
import next from 'next';
const {
  app,
  dialog,
  Menu,
  nativeImage,
  shell,
  Tray
} = electron;
import indexRouteController from './routes/indexRouteController.js';

const DEV = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 10102;

const nextApp = next();
const handle = nextApp.getRequestHandler();

const server = express();

server.use('/', indexRouteController);
server.all('*', (req: Request, res: Response) => handle(req, res));

const setupTrayMenu = () => {
  // const image = nativeImage.createFromPath(path.join(import.meta.dirname, 'build/icon.png'));
  const image = nativeImage.createFromNamedImage('NSApplicationIcon');
  const tray = new Tray(image.resize({ width: 16, height: 16 }));
  const menu = Menu.buildFromTemplate([
    {
      label: 'Launch',
      click: _ => shell.openExternal(`http://localhost:${PORT}`)
    },
    {
      label: 'About',
      click: _ => dialog.showMessageBox({
        type: 'info',
        message: `node101 | ${app.getVersion()}`,
        icon: image
      })
    },
    {
      type: 'separator'
    },
    {
      label: 'Quit',
      click: app.quit
    }
  ]);

  tray.setContextMenu(menu);
};

if (!app.requestSingleInstanceLock())
  app.quit();

app.dock.hide();

autoUpdater.updateElectronApp({
  repo: 'node101-io/zkvot',
});

app.on('ready', _ => {
  nextApp.prepare().then(_ => {
    server.listen(PORT, (err: Error) => {
      if (err) throw err;

      setupTrayMenu();

      console.log(`> Ready on http://localhost:${PORT}`);
    });
  });
});
app.on('error', (err: Error) => {
    dialog.showMessageBoxSync({
      type: 'error',
      message: err && err.code == 'EADDRINUSE' ?
        `Port ${PORT} is already in use by another application. System restart is recommended.` :
        `Server could not be started: ${err}`
    });

    app.quit();
});
