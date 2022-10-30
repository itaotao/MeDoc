const qiniuManager = require('./src/utils/QiniuManager')
const {v4: uuidv4} = require("uuid");
const {join} = require("path");

const Store = require('electron-store')
const accessKey = 'ir9GbJotIaon4amS7RyuyTRdLIxuEydQFMxmEPEu';
const secretKey = 'WYcWfJJB38O_WFpIYJMamgJVJNQfEWQWuLKbidlm';
const fileStore = new Store({'name': 'Files Data'})
const settingsStore = new Store({ 'name': 'Settings'})
// 空间对应的机房
const zone = 'as0';
const localFile = "C:\\Users\\Administrator\\Documents\\测试下载功能.md";
const key = '测试下载功能.md';
const manager =  new qiniuManager(accessKey,secretKey,'medocument',zone)

const objToArr = (obj) => {
    return Object.keys(obj).map(key => obj[key])
}
console.log(join(__dirname, './settings/settings.html'))
// const id = '00db5ee8-8e71-4686-9f89-dfaff72f0cc5'


// manager.uploadFile(key, localFile).then( (data) => {
//     console.log(data)
//
// })
// manager.getBucketDomain().then( (data) => {
//     console.log(data)
// })
// manager.generateDownloadLink(key).then( (data) => {
//     console.log(data)
// })

// manager.getFileList().then( (data) => {
//
//     const items = data.items;
//     console.log(items)
//     // items.forEach(function(item) {
//     //     console.log(item.key);
//     //     console.log(item.putTime);
//     //     console.log(item.hash);
//     //     console.log(item.fsize);
//     //     console.log(item.mimeType);
//     //     console.log(item.type);
//     // });
// })
// manager.downloadFile(key,localFile).then( (data) =>{
//     console.log(data)
// }).catch((err)=>{
//     console.log(err)
// })
// console.log(settingsStore.get('savedFileLocation'))
// const currentFilesObj = fileStore.get('files') || {}
// const getTitles = objToArr(currentFilesObj).map(file => {
//     return `${file.title}.md`
// })
//Object.keys(currentFilesObj).length === 0

// const downFileArr = []
// manager.getFileList( ).then((data) => {
//     const items = data.items
//
//     const downPromiseArr = items.filter(item => {
//         if (getTitles.length === 0 ){
//             const newId = uuidv4()
//
//             downFileArr[newId] = {
//                 'id': newId,
//                 'key': item.key,
//                 'path': join(settingsStore.get('savedFileLocation'), `/${item.key}`),
//                 'updatedAt': Math.round(item.putTime / 10000),
//                 'isSynced': true,
//                 'isInStore': false
//             }
//         }else{
//             objToArr(currentFilesObj).map(file => {
//                 if (item.key === `${file.title}.md` && Math.round(item.putTime / 10000) > file.updatedAt) {
//                     console.log('bbb')
//                     downFileArr[file.id] = {
//                         'id': file.id,
//                         'key': item.key,
//                         'path': file.path,
//                         'updatedAt': Math.round(item.putTime / 10000),
//                         'isSynced': true,
//                         'isInStore': true
//                     }
//                 } else if (!getTitles.includes(item.key)) {
//                     const getNewTitles = objToArr(downFileArr).map(file => {
//                         return file.key
//                     })
//                     if (!getNewTitles.includes(item.key)) {
//                         const newId = uuidv4()
//
//                         downFileArr[newId] = {
//                             'id': newId,
//                             'key': item.key,
//                             'path': join(settingsStore.get('savedFileLocation'), `/${item.key}`),
//                             'updatedAt': Math.round(item.putTime / 10000),
//                             'isSynced': true,
//                             'isInStore': false
//                         }
//                     }
//                 }
//             })
//         }
//
//         const getNewTitles = objToArr(downFileArr).map(file => {
//             return file.key
//         })
//         return getNewTitles.includes(item.key)
//     })
//
//     objToArr(downFileArr).map(item => {
//        return  manager.downloadFile(item.key, item.path)
//     })
//     return Promise.all(downPromiseArr)
// }).then( (arr) => {
//     console.log(downFileArr)
// })