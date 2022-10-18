import './App.css'
import 'easymde/dist/easymde.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'

import React, { useState} from "react"
import {faPlus, faFileImport, faSave} from '@fortawesome/free-solid-svg-icons'
import SimpleMde from "react-simplemde-editor"
import {marked} from "marked"
import { v4 as uuidv4 } from 'uuid';
import { flattenArr, objToArr} from "./utils/helper";
import fileHelper from "./utils/fileHelper";


import FileSearch from "./components/FileSearch"
import FileList from "./components/FileList"
import BottomBtn from "./components/BottomBtn"
import TabList from "./components/TabList"


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

    const [files, setFiles] = useState(fileStore.get('files') || {})
    const [isOnComposition, setIsOnComposition] = useState(false)
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


    const onCompositionStart = ()=>{
        setIsOnComposition(true)

    }
    const onCompositionEnd = () =>{
        setIsOnComposition(false)
    }

    const fileChange = (id, value) => {
        if (!isOnComposition){
            const newFile = { ...files[id], body: value }

            setFiles({ ...files, [id]: newFile })
            //更新未保存的文档ID
            if (!unsavedFileIDs.includes(id)) {
                setUnsavedFileIDs([...unsavedFileIDs, id])
            }
        }
    }
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
    // useEffect(() => {
    //     filesArr.forEach(function(v,i){
    //
    //         fs.access(v['path'],function (err){
    //             if (err){
    //                 delete filesArr[i]
    //                 delete files[v['id']]
    //                 saveFilesToStore(files)
    //                 setFiles(files)
    //             }
    //         })
    //
    //     })
    // })
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
                    <div className="row no-gutters button-group ">

                        <BottomBtn
                            text="新建"
                            colorClass="btn-primary"
                            icon={faPlus}
                            onBtnClick={createNewFile}
                        />


                        <BottomBtn
                            text="导入"
                            colorClass="btn-success"
                            icon={faFileImport}
                            onBtnClick={importFiles}
                        />

                    </div>
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
                        <SimpleMde
                            id="mardown-editor"
                            key={activeFile.id}
                            value={activeFile && activeFile.body}
                            onCompositionStart={onCompositionStart}
                            onCompositionEnd={onCompositionEnd}
                            onChange={(value)=>{fileChange(activeFile.id,value)}}

                            options={{
                                previewRender: (plainText, preview) => { // Async method
                                    setTimeout(() => {
                                        preview.innerHTML = marked.parse(plainText)
                                    });

                                    return "Loading...";
                                },
                                placeholder: '请使用 Markdown 格式书写 ',
                                autofocus: true,
                                spellChecker: false,
                                minHeight: '730px',
                            }}

                        />
                        <BottomBtn
                            text="保存"
                            colorClass="btn-success pull-right "
                            icon={faSave}
                            onBtnClick={onSaveClick}
                        />
                    </>}

                </div>
            </div>
        </div>);
}

export default App;
