const {app,ipcMain,Menu,dialog} = require('electron')
const isDev = require('electron-is-dev')
const menuTemplate = require('./src/menuTemplate')
const AppWindow = require('./src/AppWindow')
const path = require('path')
const Store = require('electron-store')
// 初始化Store
Store.initRenderer()
const settingsStore = new Store({ 'name': 'Settings'})
const QiniuManager = require('./src/utils/QiniuManager')
const {v4: uuidv4} = require("uuid");
const http = require("http");
const logger = require("electron-log");
const fileStore = new Store({'name': 'Files Data'})
const objToArr = (obj) => {
    return Object.keys(obj).map(key => obj[key])
}
// 初始化remote
require('@electron/remote/main').initialize()
// const {ipcMain} = require("@electron/remote");
let mainWindow,settingsWindow,fileWindow,downloadWindow;
const createManager = () => {
    const qiniuConfig = settingsStore.get('qiniuConfig')
    const accessKey = qiniuConfig['accessKey']
    const secretKey = qiniuConfig['secretKey']
    const bucketName = qiniuConfig['bucket']
    return new QiniuManager(accessKey, secretKey, bucketName,'as0')
}

app.on('ready',() => {


    const mainWindowConfig = {
        width : 1024,
        height : 768,
        icon: path.join(__dirname,'./logo.png'),
        webPreferences : {
            nodeIntegration:true,
            enableRemoteModule:true,
            contextIsolation:false,
            webSecurity: false
        }
    }

    const urlLocation = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '/index.html')}`
    mainWindow = new AppWindow(mainWindowConfig,urlLocation)
    // mainWindow.webContents.openDevTools({mode:'bottom'});
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
            icon: path.join(__dirname,'./logo.png'),
            modal:true,
            resizable:false,
            minimizable:false,
            webPreferences : {
                nodeIntegration:true,
                enableRemoteModule:true,
                contextIsolation:false
            }
        }
        const settingsFileLocation = isDev ? `file://${path.join(__dirname, './settings/settings.html')}` : `file://${path.join(__dirname, '../settings/settings.html')}`
        settingsWindow = new AppWindow(settingsWindowConfig, settingsFileLocation)
        // settingsWindow.webContents.openDevTools({mode:'bottom'});

        settingsWindow.removeMenu()
        settingsWindow.on('closed', () => {
            settingsWindow = null
        })
        require('@electron/remote/main').enable(settingsWindow.webContents)
    })
    ipcMain.on('open-file-window', () => {
        // const fileWindowConfig = {
        //     width: 370,
        //     height: 200,
        //     parent: mainWindow,
        //     // modal:true,
        //     // resizable:false,
        //     // minimizable:false,
        //     webPreferences : {
        //         nodeIntegration:true,
        //         enableRemoteModule:true,
        //         contextIsolation:false
        //     }
        // }
        // const fileLocation = isDev ? `file://${path.join(__dirname, './settings/file.html')}` : `file://${path.join(__dirname, '../settings/file.html')}`
        // fileWindow = new AppWindow(fileWindowConfig, fileLocation)
        //
        // fileWindow.removeMenu()
        // fileWindow.on('closed', () => {
        //     fileWindow = null
        // })
        // require('@electron/remote/main').enable(fileWindow.webContents)
        mainWindow.webContents.send('open-create-file-window')
    })
    ipcMain.on('download-newApp-window', (version,update_info,download_url) => {
        const downWindowConfig = {
            width: 500,
            height: 500,
            parent: mainWindow,
            webPreferences : {
                nodeIntegration:true,
                enableRemoteModule:true,
                contextIsolation:false
            }
        }
        const fileLocation = isDev ? `file://${path.join(__dirname, './settings/download.html')}` : `file://${path.join(__dirname, '../settings/download.html')}`
        downloadWindow = new AppWindow(downWindowConfig, fileLocation)
        if (isDev){
            downloadWindow.webContents.openDevTools({mode:'bottom'});
        }
        logger.log(update_info)
        downloadWindow.webContents.send('download-newApp-window',version,update_info,download_url)
        downloadWindow.removeMenu()
        downloadWindow.on('closed', () => {
            downloadWindow = null
        })
        require('@electron/remote/main').enable(downloadWindow.webContents)

    })
    ipcMain.on('check-version', (event) => {

        const url = 'http://medoc.w2ex.com/latest.json';
        logger.log(url)
        http.get(url, function(res) {
            res.on("data",(data)=>{
                const config = require("./package.json");
                const remoteConfig = JSON.parse(data.toString())
                if (remoteConfig.version > config.version ){
                    console.log(process.platform)
                    dialog.showMessageBox({
                        type: 'info',
                        title: '应用有新的版本',
                        message: '发现应用新版本，是否现在下载？',
                        buttons: ['是', '否']
                    }).then(function (message){
                        if (message.response === 0){
                            console.log(remoteConfig.version)
                            ipcMain.emit('download-newApp-window', remoteConfig.version, remoteConfig.update_info, remoteConfig[process.platform])
                            setTimeout(() => {
                                downloadWindow.webContents.send('download-newApp-window', remoteConfig.version, remoteConfig.update_info, remoteConfig[process.platform])
                            }, 2000)

                        }
                    })
                }else{
                    dialog.showMessageBox({
                        type: 'info',
                        title: '没有新的版本',
                        message: '没有发现新的版本可供更新'
                    }).then()
                }
            })
        }).on('error', function(e) {
            console.log("Got error: " + e.message);
        });

    })
    ipcMain.on('create-new-file', (event, title) => {

        mainWindow.webContents.send('create-new-file',title.toString())
    })
    ipcMain.on('config-is-saved', () => {
        // watch out menu items index for mac and windows
        let qiniuMenu = process.platform === 'darwin' ? menu.items[3] : menu.items[2]
        const switchItems = (toggle) => {
            [1, 2, 3].forEach(number => {
                qiniuMenu.submenu.items[number].enabled = toggle
            })
        }
        const qiniuIsConfiged =  ['accessKey', 'secretKey', 'bucket'].every(key => !!settingsStore.get('qiniuConfig')[key])
        switchItems(qiniuIsConfiged)
    })
    ipcMain.on('upload-file', (event, data) => {
        const manager = createManager()
        manager.uploadFile(data.key, data.path).then(data => {
            console.log('上传成功', data)
            mainWindow.webContents.send('active-file-uploaded')
        }).catch((err) => {
            console.log(err)
            dialog.showErrorBox('同步失败', '请检查七牛云参数是否正确')
        })
    })
    ipcMain.on('download-file', (event, data) => {
        const manager = createManager()
        const filesObj = fileStore.get('files')
        const { key, path, id } = data
        manager.getStat(data.key).then((resp) => {
            const serverUpdatedTime = Math.round(resp.putTime / 10000)
            const localUpdatedTime = filesObj[id].updatedAt
            if (serverUpdatedTime > localUpdatedTime || !localUpdatedTime) {
                manager.downloadFile(key, path).then(() => {
                    mainWindow.webContents.send('file-downloaded', {status: 'download-success', id})
                })
            } else {
                mainWindow.webContents.send('file-downloaded', {status: 'no-new-file', id})
            }
        }, (error) => {
            if (error.statusCode === 612) {
                mainWindow.webContents.send('file-downloaded', {status: 'no-file', id})
            }
        })
    })
    ipcMain.on('upload-all-to-qiniu', () => {
        mainWindow.webContents.send('loading-status', true)
        const manager = createManager()
        const filesObj = fileStore.get('files') || {}
        const uploadPromiseArr = Object.keys(filesObj).map(key => {
            const file = filesObj[key]
            return manager.uploadFile(`${file.title}.md`, file.path)
        })
        Promise.all(uploadPromiseArr).then(result => {
            // show uploaded message
            dialog.showMessageBox({
                type: 'info',
                title: `成功上传了${result.length}个文件`,
                message: `成功上传了${result.length}个文件`,
            })
            mainWindow.webContents.send('files-uploaded')
        }).catch(() => {
            dialog.showErrorBox('同步失败', '请检查七牛云参数是否正确')
        }).finally(() => {
            mainWindow.webContents.send('loading-status', false)
        })
    })
    ipcMain.on('delete-file', (event, data) => {
        const manager = createManager()
        manager.deleteFile(data.key).then(data => {
            console.log('删除成功', data)
        }).catch((err) => {
            console.log(err)
            dialog.showErrorBox('同步删除文档失败', '请检查七牛云参数是否正确')
        })
    })
    ipcMain.on('rename-file', (event, data) => {
        const manager = createManager()
        manager.moveFile(data.key,data.desKey).then(data => {
            console.log('重命名成功', data)
        }).catch((err) => {
            console.log(err)
            dialog.showErrorBox('重命名失败', '请检查七牛云参数是否正确')
        })
    })
    //同步所有云端文件到本地
    ipcMain.on('download-all-from-qiniu', () => {
        mainWindow.webContents.send('loading-status', true)
        const manager = createManager()
        const currentFilesObj = fileStore.get('files') || {}
        const getTitles = objToArr(currentFilesObj).map(file => {
            return `${file.title}.md`
        })
        const downFileArr = []
        manager.getFileList( ).then((data) => {
            const items = data.items

            const downPromiseArr = items.filter( item => {

                if (getTitles.length === 0 ){
                    const newId = uuidv4()

                    downFileArr[newId] = {
                        'id': newId,
                        'key': item.key,
                        'path': path.join(settingsStore.get('savedFileLocation'), `/${item.key}`),
                        'updatedAt': Math.round(item.putTime / 10000),
                        'isSynced': true,
                        'isInStore': false
                    }
                }else{
                    objToArr(currentFilesObj).map(file => {
                        if (item.key === `${file.title}.md` && Math.round(item.putTime / 10000) > file.updatedAt) {
                            downFileArr[file.id] = {
                                'id': file.id,
                                'key': item.key,
                                'path': file.path,
                                'updatedAt': Math.round(item.putTime / 10000),
                                'isSynced': true,
                                'isInStore': true
                            }
                        } else if (!getTitles.includes(item.key)) {
                            const getNewTitles = objToArr(downFileArr).map(file => {
                                return file.key
                            })
                            if (!getNewTitles.includes(item.key)) {
                                const newId = uuidv4()

                                downFileArr[newId] = {
                                    'id': newId,
                                    'key': item.key,
                                    'path': path.join(settingsStore.get('savedFileLocation'), `/${item.key}`),
                                    'updatedAt': Math.round(item.putTime / 10000),
                                    'isSynced': true,
                                    'isInStore': false
                                }
                            }
                        }
                    })
                }

                const getNewTitles = objToArr(downFileArr).map(file => {
                    return file.key
                })
                return getNewTitles.includes(item.key)
            })

            objToArr(downFileArr).map(item => {
                return  manager.downloadFile(item.key, item.path)
            })
            return Promise.all(downPromiseArr)
        }).then( (arr) => {

            const finalFilesObj = objToArr(downFileArr).reduce((newFilesObj,qiniuFile) => {
                if (qiniuFile.isInStore){
                    const updatedItem = {
                        ...currentFilesObj[qiniuFile.id],
                        isSynced: true,
                        updatedAt:qiniuFile.updatedAt
                    }
                    return {
                        ...newFilesObj,[qiniuFile.id]:updatedItem
                    }
                }else{
                    const newItem = {
                        id:qiniuFile.id,
                        path:qiniuFile.path,
                        title:path.basename(qiniuFile.key,'.md'),
                        createAt: qiniuFile.updatedAt ,
                        isSynced: true,
                        updatedAt: qiniuFile.updatedAt
                    }
                    return {
                        ...newFilesObj,[qiniuFile.id]:newItem
                    }
                }

            },{...currentFilesObj})
            mainWindow.webContents.send('download-all-file', arr,finalFilesObj)
        }).catch((err) => {
            dialog.showErrorBox('同步失败', '请检查七牛云参数是否正确')
        }).finally(() => {
            mainWindow.webContents.send('loading-status', false)
        })

    })
    require('@electron/remote/main').enable(mainWindow.webContents)
    //禁止程序多开，此处需要单例锁的打开注释即可
    const gotTheLock = app.requestSingleInstanceLock();
    if (!gotTheLock) {
        app.quit();
    }
})