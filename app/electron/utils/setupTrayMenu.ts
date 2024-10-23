import electron from 'electron';
const { app, dialog, nativeImage, Tray, Menu, shell } = electron;

export default (port: number) => {
  // const image = nativeImage.createFromPath(path.join(import.meta.dirname, 'build/icon.png'));
  const image = nativeImage.createFromNamedImage('NSApplicationIcon');
  const tray = new Tray(image.resize({ width: 16, height: 16 }));
  const menu = Menu.buildFromTemplate([
    {
      label: 'Launch',
      click: () => shell.openExternal(`http://localhost:${port}`),
    },
    {
      label: 'About',
      click: () =>
        dialog.showMessageBox({
          type: 'info',
          message: `zkVot | ${app.getVersion()}`,
          icon: image,
        }),
    },
    {
      type: 'separator',
    },
    {
      label: 'Quit',
      click: app.quit,
    },
  ]);

  tray.setContextMenu(menu);
};
