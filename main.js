// Modules to control application life and create native browser window
const {app, BrowserWindow,ipcMain} = require('electron')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
const path = require('path');
function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1050,
     height: 600,
     minimizable: true,
     maximizable: true
    })
  

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  mainWindow.openDevTools();
  ipcMain.on('request-update-label-in-second-window', (event, arg) => {
    // Request to update the label in the renderer process of the second window
    // We'll send the same data that was sent to the main process
    // Note: you can obviously send the 
   // mainWindow.loadFile('.resume/index.html')
    mainWindow.webContents.send('action-add-row', arg);
});
ipcMain.on('request-resume', (event, arg) => {
  // Request to update the label in the renderer process of the second window
  // We'll send the same data that was sent to the main process
  // Note: you can obviously send the 
  mainWindow.loadURL('newRow.html')
  mainWindow.webContents.send('request-resume-action', arg);
});

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}
   

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


// Attach listener in the main process with the given ID
ipcMain.on('request-mainprocess-action', (event, arg) => {
    // Displays the object sent from the renderer process:
    //{
    //    message: "Hi",
    //    someData: "Let's go"
    //}
    console.log(
        arg
    );

    // Return some data to the renderer process with the mainprocess-response ID
    event.sender.send('mainprocess-response', "Hello World!");
});