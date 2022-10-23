const {app,ipcMain,Menu} = require('electron')
const isDev = require('electron-is-dev')
const menuTemplate = require('./src/menuTemplate')
const AppWindow = require('./src/AppWindow')
const path = require('path')
const Store = require('electron-store');
// 初始化remote
require('@electron/remote/main').initialize()
// const {ipcMain} = require("@electron/remote");
// 初始化Store
Store.initRenderer();
let mainWindow,settingsWindow;
app.on('ready',() => {

    const mainWindowConfig = {
        width : 1024,
        height : 768,
        webPreferences : {
            nodeIntegration:true,
            enableRemoteModule:true,
            contextIsolation:false
        }
    }

    const urlLocation = isDev ? 'http://localhost:3000' : 'http://baidu.com'
    mainWindow = new AppWindow(mainWindowConfig,urlLocation)
    mainWindow.webContents.openDevTools({mode:'bottom'});
    // set the menu
    let menu = Menu.buildFromTemplate(menuTemplate)
    Menu.setApplicationMenu(menu)

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
    ipcMain.on('open-settings-window', () => {
        const settingsWindowConfig = {
            width: 700,
            height: 400,
            parent: mainWindow,
            webPreferences : {
                nodeIntegration:true,
                enableRemoteModule:true,
                contextIsolation:false
            }
        }
        const settingsFileLocation = `file://${path.join(__dirname, './settings/settings.html')}`
        settingsWindow = new AppWindow(settingsWindowConfig, settingsFileLocation)
        // settingsWindow.webContents.openDevTools({mode:'bottom'});
        settingsWindow.removeMenu()
        settingsWindow.on('closed', () => {
            settingsWindow = null
        })
        require('@electron/remote/main').enable(settingsWindow.webContents)
    })
    require('@electron/remote/main').enable(mainWindow.webContents)

})