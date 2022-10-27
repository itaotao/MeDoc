const qiniuManager = require('./src/utils/qiniuManager')
const accessKey = 'ir9GbJotIaon4amS7RyuyTRdLIxuEydQFMxmEPEu';
const secretKey = 'WYcWfJJB38O_WFpIYJMamgJVJNQfEWQWuLKbidlm';

// 空间对应的机房
const zone = 'as0';
const localFile = "C:\\Users\\Administrator\\Documents\\测试下载功能.md";
const key = '测试下载功能.md';
const manager =  new qiniuManager(accessKey,secretKey,'medocument',zone)
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
manager.downloadFile(key,localFile).then( (data) =>{
    console.log(data)
}).catch((err)=>{
    console.log(err)
})
