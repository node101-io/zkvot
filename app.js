const autoUpdater = require('update-electron-app');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const express = require('express');
const favicon = require('serve-favicon');
const http = require('http');
const path = require('path');
const session = require('express-session');
const {
  app: electronApp,
  dialog,
  Menu,
  nativeImage,
  shell,
  Tray
} = require('electron');

dotenv.config();

const SafeStore = require('./utils/safeStore');

const APP_PORT = process.env.APP_PORT || 3000;

const expressApp = express();
const localServer = http.createServer(expressApp);

const daLayerRouteController = require('./routes/daLayersRoute');
const dockerRouteController = require('./routes/dockerRoute');

expressApp.set('view engine', 'pug');
expressApp.set('views', path.join(__dirname, 'views'));

expressApp.use(express.static(path.join(__dirname, 'public')));
expressApp.use(favicon(path.join(__dirname, 'public', 'img/icons/favicon.ico')));
expressApp.use(bodyParser.json());
expressApp.use(bodyParser.urlencoded({ extended: true }));
expressApp.use(session({
  secret: 'node101', // TODO: change this data/ yoksa oluştur varsa al
  resave: false,
  saveUninitialized: true
}));

expressApp.use('/da-layers', daLayerRouteController);
expressApp.use('/docker', dockerRouteController);

const setupTrayMenu = _ => {
  const image = nativeImage.createFromPath(path.join(__dirname, 'build/icon.png'));
  const tray = Tray(image.resize({ width: 16, height: 16 }));
  const menu = Menu.buildFromTemplate([
    {
      label: 'Launch',
      click: _ => shell.openExternal(`http://localhost:${APP_PORT}`)
    },
    {
      label: 'About',
      click: _ => dialog.showMessageBox({
        type: 'info',
        message: `node101 | ${electronApp.getVersion()}`,
        icon: image
      })
    },
    {
      type: 'separator'
    },
    {
      label: 'Quit',
      click: _ => electronApp.quit()
    }
  ]);

  tray.setContextMenu(menu);
};

if (!electronApp.requestSingleInstanceLock())
  electronApp.quit();

electronApp.dock.hide();

autoUpdater.updateElectronApp();

electronApp
  .on('ready', _ => {
    SafeStore.init(err => {
      if (err) console.log(err);

      localServer.listen(APP_PORT, _ => {
        console.log(`Server is on port ${APP_PORT} and is running.`);

        setupTrayMenu();
      }).on('error', err => {
        if (err && err.code == 'EADDRINUSE')
          dialog.showMessageBoxSync({
            type: 'warning',
            message: `Port ${APP_PORT} is already in use by another application. System restart is recommended.`
          });
        else
          dialog.showMessageBoxSync({
            type: 'error',
            message: `Server could not be started: ${err}`
          });

        electronApp.quit();
      });
    });
  });