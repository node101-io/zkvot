import autoUpdater from "update-electron-app";
import electron from "electron";
import express from "express";
import next from "next";
import setupTrayMenu from "./utils/setupTrayMenu.js";
import indexRouteController from "./routes/indexRouteController.js";

const { app } = electron;

const DEV = process.env.NODE_ENV !== "production";
const PORT = process.env.PORT || 10101;

console.log('App Path:', app.getAppPath());
console.log('Current Directory:', import.meta.dirname);

const nextApp = next({
  dev: false,
  dir: app.getAppPath()
});
const handle = nextApp.getRequestHandler();

const server = express();
server.use(express.json());

server.use("/", indexRouteController);
server.all("*", (req, res) => handle(req, res));

if (!app.requestSingleInstanceLock()) app.quit();

app.dock.hide();

autoUpdater.updateElectronApp({
  repo: "node101-io/zkvot",
});

app.on("ready", () => {
  nextApp.prepare().then(() => {
    server.listen(PORT, () => {
      setupTrayMenu(PORT);

      console.log(`> Ready on http://localhost:${PORT}`);
    });
  });
});
app.on("error", () => app.quit());
