const qiniuManager = require('./src/utils/qiniuManager')
const accessKey = 'ir9GbJotIaon4amS7RyuyTRdLIxuEydQFMxmEPEu';
const secretKey = 'WYcWfJJB38O_WFpIYJMamgJVJNQfEWQWuLKbidlm';

// 空间对应的机房
const zone = 'as0';
const localFile = "C:\\Users\\Administrator\\Documents\\hello.md";
const key = 'hello.md';
const manager =  new qiniuManager(accessKey,secretKey,'medocument',zone)
// manager.uploadFile(key, localFile).then( (data) => {
//     console.log(data)
//
// })
manager.getBucketDomain().then( (data) => {
    console.log(data)
})
manager.generateDownloadLink(key).then( (data) => {
    console.log(data)
})