import './App.css'
import 'easymde/dist/easymde.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'

import React, {useState} from "react"
import {faPlus, faFileImport} from '@fortawesome/free-solid-svg-icons'
import SimpleMde from "react-simplemde-editor"
import {marked} from "marked"
import { v4 as uuidv4 } from 'uuid';
import {flattenArr,objToArr} from "./ultils/helper";

import FileSearch from "./components/FileSearch"
import defaultFiles from "./ultils/defaultFiles"
import FileList from "./components/FileList"
import BottomBtn from "./components/BottomBtn"
import TabList from "./components/TabList"

// const fs = window.require('fs')
// console.dir(fs)

function App() {

    const [files, setFiles] = useState(defaultFiles)
    const [isOnComposition, setIsOnComposition] = useState(false)
    const [activeFileID, setActiveFileID] = useState('')
    const [opendFileIDs, setOpenFileIDs] = useState([])
    const [unsavedFileIDs, setUnsavedFileIDs] = useState([])
    const [ searchedFiles, setSearchedFiles ] = useState([])
    // const filesArr = objToArr(files)

    const openedFiles = opendFileIDs.map(openID => {
        return files.find(file => file.id === openID)
    })
    const activeFile = files.find(file => file.id === activeFileID)
    // const activeFile = files[activeFileID]
    let   fileListArr = searchedFiles.length > 0 ? searchedFiles : files
    const fileClick = (id) => {

        setActiveFileID(id)

        if (!opendFileIDs.includes(id)) {

            setOpenFileIDs([...opendFileIDs, id])
        }

    }
    const tabClick = (id) => {
        //id = id - 1
        setActiveFileID(id)
    }
    const tabClose = (id) => {
        //id = id - 1
        const tabsWithout = opendFileIDs.filter(fileID => fileID !== id)
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
            const newFiles = files.map(file => {
                if (file.id === id){
                    file.body = value
                }
                return file
            })
            setFiles(newFiles)
            // const newFile = { ...files[id], body: value }
            // setFiles({ ...files, [id]: newFile })
            //更新未保存的文档ID
            if (!unsavedFileIDs.includes(id)) {
                setUnsavedFileIDs([...unsavedFileIDs, id])
            }
        }
    }
    const deleteFile = (id) => {
        const newFiles = files.filter(function (file){return file.id !== id})
        // delete files[id]
        setFiles(newFiles)
        tabClose(id)
    }
    const updateFileName = (id,title) => {


        const newFiles = files.map(file =>{
            if (file.id === id){
                file.title = title
                file.isNew = false
            }
            return file
        })
        setFiles(newFiles)
        // const modifiedFile = { ...files[id], title, isNew: false }
        // setFiles({ ...files, [id]: modifiedFile })
    }
    const fileSearch = (keyword) =>{
        if (keyword){
            const newFiles = files.filter(function (file){return file.title.includes(keyword)})
            setSearchedFiles(newFiles)
        }else{
            setSearchedFiles([])
            setFiles(files)
        }
    }
    const createNewFile = () => {
        const newId = uuidv4()
        const newFiles = [
            ...files,
            {
                id: newId,
                title: '',
                body: '## 请输入MarkDown文档',
                createAt: new Date().getTime(),
                isNew: true
            }
        ]
        setFiles(newFiles)
        // setFiles({...files,[newId]:newFiles})
    }
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
                    </>}

                </div>
            </div>
        </div>);
}

export default App;
