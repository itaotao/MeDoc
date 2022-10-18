const fs = window.require('fs').promises
// const path = require('path')
const fileHelper = {
    readFile: (path) => {
      return    fs.readFile(path, { encoding: 'utf8'})
    },
    writeFile: (path, content) => {
        return fs.writeFile(path, content, { encoding: 'utf8'})
    },
    renameFile: (path, newPath) => {
        return fs.rename(path, newPath)
    },
    deleteFile: (path) => {
        return fs.unlink(path)
    },

}
// const  testPath =   path.join(__dirname,'helper.js')
// const  testWritePath =   path.join(__dirname,'helper.md')
//  fileHelper.readFile(testPath).then((data)=>{
//      console.log(data)
//  })
// fileHelper.writeFile(testWritePath,'## hello').then(()=>{
//     console.log('write success')
// })
export default fileHelper