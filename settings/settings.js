const { ipcRenderer } = window.require('electron')
const remote = window.require("@electron/remote")
const Store = window.require('electron-store')
const settingsStore = new Store({name: 'Settings'})

const $ = (selector) => {
  const result = document.querySelectorAll(selector)
  return result.length > 1 ? result : result[0]
}

document.addEventListener('DOMContentLoaded', () => {
  let savedLocation = settingsStore.get('savedFileLocation')
  if (savedLocation) {
    $('#savedFileLocation').value = savedLocation
  }
  let qiniuConfig = settingsStore.get('qiniuConfig')
  if (qiniuConfig){
    $("#accessKey").value = qiniuConfig.accessKey
    $("#secretKey").value = qiniuConfig.secretKey
    $("#bucketName").value = qiniuConfig.bucket
  }
  $('#select-new-location').addEventListener('click', () => {
    remote.dialog.showOpenDialog({
      properties: ['openDirectory'],
      message: '选择文件的存储路径',
    }).then((path) => {

      if (path.canceled === false) {
        $('#savedFileLocation').value = path.filePaths
        savedLocation = path.filePaths
      }

    })
  })
  $('#settings-form').addEventListener('submit', (e) => {

    let accessKey =  $("#accessKey").value
    let secretKey = $("#secretKey").value
    let bucket =  $("#bucketName").value
    if(accessKey && secretKey && bucket){
      let qiniuConfig = {
        'accessKey' : accessKey,
        'secretKey' : secretKey,
        'bucket'    : bucket
      }
      settingsStore.set('qiniuConfig',qiniuConfig)
    }

    settingsStore.set('savedFileLocation',savedLocation)
    remote.getCurrent().window.close()
  })
  $('.nav-tabs').addEventListener('click', (e) => {
    e.preventDefault()
    $('.nav-link').forEach(element => {
      element.classList.remove('active')
    })
    e.target.classList.add('active')
    $('.config-area').forEach(element => {
      element.style.display = 'none'
    })
    $(e.target.dataset.tab).style.display = 'block'
  })

})