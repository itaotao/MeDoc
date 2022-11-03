const qiniu = require('qiniu')
const fs = require('fs')
const http = require('http');
class QiniuManager {
    constructor(accessKey, secretKey, bucket, zone = 'z0') {
        //generate mac
        this.mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
        this.bucket = bucket
        this.zone = zone
        // init config class
        this.config = new qiniu.conf.Config()
        // 空间对应的机房
        this.config.zone = this.getZone(this.zone)

        this.bucketManager = new qiniu.rs.BucketManager(this.mac, this.config);
    }
    uploadFile(key, localFilePath) {
        // generate uploadToken
        const options = {
            scope: this.bucket + ":" + key,
            returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)"}'
        };
        const putPolicy = new qiniu.rs.PutPolicy(options)
        const uploadToken=putPolicy.uploadToken(this.mac)
        const formUploader = new qiniu.form_up.FormUploader(this.config)
        const putExtra = new qiniu.form_up.PutExtra()
        //文件上传
        return new Promise((resolve, reject) => {
            formUploader.putFile(uploadToken, key, localFilePath, putExtra, this._handleCallback(resolve, reject));
        })

    }
    deleteFile(key) {
        return new Promise((resolve, reject) => {
            this.bucketManager.delete(this.bucket, key, this._handleCallback(resolve, reject))
        })
    }
    moveFile(key,desKey){
        // 强制覆盖已有同名文件
        const options = {
            force: true
        }
        return new Promise((resolve, reject) => {
            this.bucketManager.move(this.bucket,key,this.bucket,desKey,options,this._handleCallback(resolve, reject))
        })
    }

    getFileList(options = {}) {
        if (!options){
            options = {
                limit: 2,
                prefix: '/',
            }
        }
        return new Promise((resolve, reject) => {
            this.bucketManager.listPrefix(this.bucket,options,this._handleCallback(resolve, reject))
        })
    }
    getBucketDomain() {
        const reqURL = `http://api.qiniu.com/v6/domain/list?tbl=${this.bucket}`
        const digest = qiniu.util.generateAccessToken(this.mac, reqURL)
        return new Promise((resolve, reject) => {
            qiniu.rpc.postWithoutForm(reqURL, digest, this._handleCallback(resolve, reject))
        })
    }
    getStat(key) {
        return new Promise((resolve, reject) => {
            this.bucketManager.stat(this.bucket, key, this._handleCallback(resolve, reject))
        })
    }
    generateDownloadLink(key) {
        const domainPromise = this.publicBucketDomain ?
            Promise.resolve([this.publicBucketDomain]) : this.getBucketDomain()
        return domainPromise.then(data => {
            if (Array.isArray(data) && data.length > 0) {
                for (const url of data) {
                    if (this.checkUrl(url)){
                        const pattern = /^https?/
                        this.publicBucketDomain = pattern.test(url) ? url : `http://${url}`
                        break
                    }
                }
                return this.bucketManager.publicDownloadUrl(this.publicBucketDomain, key)
            } else {
                throw Error('域名未找到，请查看存储空间是否已经过期')
            }
        })
    }
    downloadFile(key, dest) {
        const timeStamp = new Date().getTime()
        return new Promise((resolve, reject)=>{
            // 确保dest路径存在
            const file = fs.createWriteStream(dest);
            this.generateDownloadLink(key).then(uri => {
                uri = `${uri}?timestamp=${timeStamp}`
                http.get(uri, (res)=>{
                    if(res.statusCode !== 200){
                        reject(res.statusCode);
                        return;
                    }

                    res.on('end', ()=>{
                        console.log('download end');
                    });

                    // 进度、超时等

                    file.on('finish', ()=>{
                        console.log('finish write file')
                        file.close(resolve);
                    }).on('error', (err)=>{
                        fs.unlink(dest);
                        reject(err.message);
                    })

                    res.pipe(file);
                })
            })

        })
    }
    getZone(zone){
        const zoneList = {
            'z0' : qiniu.zone.Zone_z0, //华东浙江
            'z1' : qiniu.zone.Zone_z1, //华东河北
            'z2' : qiniu.zone.Zone_z2, //华南广东
            'na0' : qiniu.zone.Zone_na0, //北美洛杉矶
            'as0' : qiniu.zone.Zone_as0, //亚太新加坡
            //'ap-northeast-1' : qiniu.zone.Zone_ap-northeast-1, //亚太-首尔
        }
        return zoneList[zone]
    }
     checkUrl(strUrl) {
        let regular = /^\b(((https?|ftp):\/\/)?[-a-z0-9]+(\.[-a-z0-9]+)*\.(?:com|edu|gov|int|mil|net|org|biz|info|name|museum|asia|coop|aero|[a-z][a-z]|((25[0-5])|(2[0-4]\d)|(1\d\d)|([1-9]\d)|\d))\b(\/[-a-z0-9_:\@&?=+,.!\/~%\$]*)?)$/i
        return regular.test(strUrl);
    }
    _handleCallback(resolve, reject) {
        return (respErr, respBody, respInfo) => {
            if (respErr) {
                throw respErr;
            }
            if (respInfo.statusCode === 200) {
                resolve(respBody)
            } else {
                reject({
                    statusCode: respInfo.statusCode,
                    body: respBody
                })
            }
        }
    }
}

module.exports = QiniuManager