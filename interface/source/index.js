const { app, ipcMain, BrowserWindow } = require('electron');

app.allowRendererProcessReuse = true;
app.on('ready', () => {
   const portal = new BrowserWindow({
      show: false,
      frame: false,
      width: 450,
      height: 800,
      maximizable: false,
      resizable: false,
      transparent: true,
      alwaysOnTop: true,
      webPreferences: { nodeIntegration: true, devTools: false }
   });

   ipcMain.on('show', () => portal.show());
   ipcMain.on('minimize', () => portal.minimize());
   ipcMain.on('close', () => portal.close());

   portal.loadFile('./root/index.html');
});
