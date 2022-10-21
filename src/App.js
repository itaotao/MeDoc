import './App.css'
import 'easymde/dist/easymde.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'

import React, { useState} from "react"
import {faPlus, faFileImport} from '@fortawesome/free-solid-svg-icons'
import MdEditor from 'react-markdown-editor-lite';
// 导入编辑器的样式
import 'react-markdown-editor-lite/lib/index.css';
import {marked} from "marked"
import { v4 as uuidv4 } from 'uuid';
import { flattenArr, objToArr} from "./utils/helper";
import fileHelper from "./utils/fileHelper";


import FileSearch from "./components/FileSearch"
import FileList from "./components/FileList"
import BottomBtn from "./components/BottomBtn"
import TabList from "./components/TabList"
import useIpcRenderer from "./hooks/useIpcRenderer";




const {join,basename,extname,dirname} = window.require('path')
const remote = window.require("@electron/remote")
const Store = window.require('electron-store')
const fileStore = new Store({'name':'Files Data'})
const saveFilesToStore = (files) => {
    const filesStoreObj = objToArr(files).reduce((result,file) => {

        const { id, path, title, createdAt } = file

        result[id] = {
            id,
            path,
            title,
            createdAt
        }
        return result
    },{})
    fileStore.set('files',filesStoreObj)
}

function App() {
    const mdEditor = React.useRef(null);
    const [files, setFiles] = useState(fileStore.get('files') || {})
    const [activeFileID, setActiveFileID] = useState('')
    const [openedFileIDs, setOpenFileIDs] = useState([])
    const [unsavedFileIDs, setUnsavedFileIDs] = useState([])
    const [ searchedFiles, setSearchedFiles ] = useState([])
    const filesArr = objToArr(files)
    const savedLocation = remote.app.getPath('documents')

    const openedFiles = openedFileIDs.map(openID => {
        return files[openID]
    })
    const activeFile = files[activeFileID]

    let   fileListArr = searchedFiles.length > 0 ? searchedFiles : filesArr

    const fileClick = (id) => {

        setActiveFileID(id)
        const currentFile = files[id]
        if (!currentFile.isLoaded) {
                fileHelper.readFile(currentFile.path).then( value => {
                    const newFile = { ...files[id],body:value,isLoaded:true }
                    setFiles({ ...files,[id]:newFile } )
                },(err)=>{
                    if(err){
                        remote.dialog.showMessageBox({
                            type: 'question',
                            buttons:["确认","取消"],
                            title: '删除文档',
                            message: '源文档已不在磁盘上，是否删除此文档?',
                        }).then(function (msg){
                            if(msg.response === 0){
                                delete files[id]
                                setFiles(files)
                                saveFilesToStore(files)
                                tabClose(files[id])
                                remote.dialog.showMessageBox({
                                    type: 'info',
                                    title: '操作成功',
                                    message: '删除成功'
                                }).then(r  =>{})
                            }
                        })
                    }
                })
        }
        if (!openedFileIDs.includes(id)) {

            setOpenFileIDs([...openedFileIDs, id])
        }

    }
    const tabClick = (id) => {
        setActiveFileID(id)
    }
    const tabClose = (id) => {
        const tabsWithout = openedFileIDs.filter(fileID => fileID !== id)
        setOpenFileIDs(tabsWithout)
        if (tabsWithout.length > 0) {
            setActiveFileID(tabsWithout[0])
        } else {
            setActiveFileID('')
        }
    }

    const handleEditorChange = ({ html, text }) => {
        let id = activeFileID
        if ( text !== files[id].body){
            const newFile = { ...files[id], body: text }

            setFiles({ ...files, [id]: newFile })
            //更新未保存的文档ID
            if (!unsavedFileIDs.includes(id)) {
                setUnsavedFileIDs([...unsavedFileIDs, id])
            }
        }
    };
    const deleteFile = (id) => {
        // if( files[id].title !== '' ){
        //     fileHelper.deleteFile(files[id].path).then( () => {
        //         saveFilesToStore(files)
        //     })
        // }
        // delete files[id]
        // setFiles(files)
        // tabClose(id)
        if(files[id].isNew){
            const { [id] : value, ...afterDelete } = files
            setFiles(afterDelete)
        } else {
            fileHelper.deleteFile(files[id].path).then( () => {
                const { [id] : value, ...afterDelete } = files
                setFiles(afterDelete)
                saveFilesToStore(files)
                tabClose(id)
            })
        }
    }
    const updateFileName = (id, title, isNew) => {
        const newPath = isNew ? join(savedLocation, `${title}.md`)
            : join(dirname(files[id].path), `${title}.md`)
        const modifiedFile = { ...files[id], title, isNew: false, path: newPath}
        const newFiles = { ...files, [id]: modifiedFile }
        if (isNew){
            fileHelper.writeFile(newPath,files[id].body).then( ()=>{
                setFiles(newFiles)
                saveFilesToStore(newFiles)
            })
        }else{

            // const oldPath = join(savedLocation,`${files[id].title}.md`)
            const oldPath = files[id].path
            fileHelper.renameFile(oldPath,newPath).then(()=>{
                setFiles( newFiles)
                saveFilesToStore(newFiles)
                }
            )
        }

    }
    const fileSearch = (keyword) =>{
        if (keyword){
            const newFiles = filesArr.filter(function (file){return file.title.includes(keyword)})
            setSearchedFiles(newFiles)
        }else{
            setSearchedFiles([])
            setFiles(files)
        }
    }
    const createNewFile = () => {
        const newId = uuidv4()
        const newFile = {
            id: newId,
            title: '',
            body: '## 请输入MarkDown文档',
            createAt: new Date().getTime(),
            isNew: true
        }
        setFiles({...files,[newId]:newFile})
    }
    const onSaveClick = () => {
        fileHelper.writeFile(activeFile.path,activeFile.body).then( () => {
            setUnsavedFileIDs(unsavedFileIDs.filter(id => id !== activeFile.id))
        })
    }
    const importFiles = () =>{
        remote.dialog.showOpenDialog({
            title : "请选择MarkDown文件",
            properties : ['openFile','multiSelections'],
            filters : [
                { name : 'MarkDown文件',extensions : ['md']}
            ]

        }).then( (data)=>{

            if (data.canceled === false){
                const filteredPaths = data.filePaths.filter(path =>{
                    const addFiles = Object.values(files).find(file => {
                        return file.path === path
                    })
                    return !addFiles
                })
                console.log(filteredPaths)
                const importFilesArr = filteredPaths.map(path => {
                    return {
                        id: uuidv4(),
                        title : basename(path,extname(path)),
                        path
                    }

                })

                const newFiles = { ...files, ...flattenArr(importFilesArr)}
                setFiles(newFiles)
                saveFilesToStore(newFiles)
                if(importFilesArr.length > 0){
                    remote.dialog.showMessageBox({
                        type: 'info',
                        title: '导入文件成功',
                        message: `成功导入了${importFilesArr.length}个文件`
                    })
                }
            }
        })
    }

    useIpcRenderer({
        'create-new-file' : createNewFile,
        'import-file'     : importFiles,
        'save-edit-file'  : onSaveClick,
    })

    return (<div className="App container-fluid px-0">
            <div className="row no-gutters">
                <div className="col-3  left-panel ">
                    <b><FileSearch title={"全部文档"}
                                   onFileSearch={fileSearch}/>
                    </b>
                    <FileList files={fileListArr}
                              onFileClick={fileClick}
                              onFileDelete={deleteFile}
                              onSaveEdit={updateFileName}
                    />
                </div>
                <div className="col-9  right-panel">
                    {!activeFile && <div className="start-page align-self-center">
                        选择或者新建一个MarkDown文档
                    </div>

                    }
                    {activeFile && <>
                        <TabList
                            files={openedFiles}
                            activeId={activeFileID}
                            unSaveIds={unsavedFileIDs}
                            onTabClick={tabClick}
                            onCloseTab={tabClose}
                        />
                        <MdEditor
                            ref={mdEditor}
                            style={{ height: '500px' }}
                            value={  activeFile.body }
                            placeholder= {'请使用 Markdown 格式书写 '}
                            view = {{ menu: true, md: true, html: false }}
                            renderHTML={text => marked.parse(text)}
                            onChange={handleEditorChange}
                        />
                    </>}

                </div>
            </div>
        </div>);
}

export default App;
