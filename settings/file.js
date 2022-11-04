const { ipcRenderer } = window.require('electron')
const remote = window.require("@electron/remote")
const $ = (selector) => {
    const result = document.querySelectorAll(selector)
    return result.length > 1 ? result : result[0]
}

$('#file-form').addEventListener('submit', (e) => {
    const title = $("#title").value.toString();
    if (title !== ''){
        ipcRenderer.send('create-new-file',title)
    }
        remote.getCurrentWindow().close()

}
)