const {app,BrowserWindow} = require('electron')
const isDev = require('electron-is-dev')
// 初始化
require('@electron/remote/main').initialize()
const Store = require('electron-store');
// 初始化Store
Store.initRenderer();
let mainWindow;
app.on('ready',() => {
    mainWindow = new BrowserWindow({
        width : 1024,
        height : 768,
        webPreferences : {
            nodeIntegration:true,
            enableRemoteModule:true,
            contextIsolation:false
        }
    })
    const urlLocation = isDev ? 'http://localhost:3000' : 'http://baidu.com'
    mainWindow.loadURL(urlLocation)
    mainWindow.webContents.openDevTools({mode:'bottom'});
    app.on('window-all-closed', function() {
        // 在 OS X 上，通常用户在明确地按下 Cmd + Q 之前
        // 应用会保持活动状态
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });
    // 当 window 被关闭，这个事件会被发出
    mainWindow.on('closed', function() {
        // 取消引用 window 对象，如果你的应用支持多窗口的话，
        // 通常会把多个 window 对象存放在一个数组里面，
        // 但这次不是。
        mainWindow = null;
    });
    require('@electron/remote/main').enable(mainWindow.webContents)
})