

const { ipcRenderer } = window.require('electron')
const progressStream = require('progress-stream');
const fetch = require("node-fetch");
const cp = require("child_process");
const log = require("electron-log");
const remote = window.require("@electron/remote");
const path = window.require("path");
const fs = window.require("fs");
const $ = (selector) => {
    const result = document.querySelectorAll(selector)
    return result.length > 1 ? result : result[0]
}
ipcRenderer.on('download-newApp-window',(event,version,info,url)=>{
    $("#version").innerText = version
    let info_arr = info.split(';')
    let update_info = ''
    info_arr.forEach(function (value){
        update_info += "<li  class='list-group-item'>"+value+"</li>"
    })
    $(".list-group").innerHTML = update_info
    //下载 的文件 地址
    let fileURL = url
//下载保存的文件路径
    let fileSavePath = path.join(remote.app.getPath('downloads'), path.basename(fileURL));
//缓存文件路径
    let tmpFileSavePath = fileSavePath + ".tmp";
//创建写入流
    const fileStream = fs.createWriteStream(tmpFileSavePath).on('error', function (e) {
        console.error('error==>', e)
    }).on('ready', function () {
        $('.download-info ').style.display = 'none'
        $(".progress").style.display = 'block'
        log.info("开始下载:", fileURL);
    }).on('finish', function () {
        //下载完成后重命名文件
        fs.renameSync(tmpFileSavePath, fileSavePath);
        $('.download-info ').style.display = 'block'
        $('.download-info .btn').innerHTML = '点击安装'
        $(".progress").style.display = 'none'
        $('.download-info .btn').addEventListener('click',function (){
            if (process.platform === 'win32') {
                cp.exec(fileSavePath, (err, stdout, stderr) => {

                    log.error(err, stdout, stderr)

                })
            }
            if (process.platform === 'darwin') {
                cp.exec('open ' + fileSavePath, (err, stdout, stderr) => {

                    log.error(err, stdout, stderr)

                })
            }
            if (process.platform === 'linux') {

            }

        })
        remote.getCurrentWindow().close()
        log.info('文件下载完成:', fileSavePath);
    });
//请求文件
    fetch(fileURL, {
        method: 'GET',
        headers: { 'Content-Type': 'application/octet-stream' },
        // timeout: 100,
    }).then(res => {
        //获取请求头中的文件大小数据
        let fsize = res.headers.get("content-length");
        //创建进度
        let str = progressStream({
            length: fsize,
            time: 100 /* ms */
        });
        // 下载进度
        str.on('progress', function (progressData) {
            //不换行输出
            let processNum = Number(progressData.percentage.toFixed(2)) ;
            let progress_line =  $("#progress-num")
            progress_line.setAttribute('aria-valuenow',processNum)
            if (processNum >=10){
                progress_line.style.width = processNum+'%'
            }
            progress_line.innerText = processNum+'%'
        });
        res.body.pipe(str).pipe(fileStream);
    }).catch(e => {
        //自定义异常处理
        log.error(e);
    });
})