import React, {useState, useEffect,useRef} from "react";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import { faClose} from '@fortawesome/free-solid-svg-icons'
import {faMarkdown} from "@fortawesome/free-brands-svg-icons";
import PropTypes from 'prop-types'
import useKeyPress from "../hooks/useKeyPress";
import useContextMenu from '../hooks/useContextMenu'
import { getParentNode } from '../utils/helper'

const remote = window.require("@electron/remote")

const FileList = ({files, onFileClick, onSaveEdit, onFileDelete}) => {
    const [ editStatus, setEditStatus ] = useState(false)
    const [value, setValue] = useState('')
    const enterPressed = useKeyPress(13)
    const escPressed = useKeyPress(27)
    let node = useRef(null)
    const closeEdit = (editItem) => {
        //e.preventDefault()
        setEditStatus(false)
        setValue('')
        if (editItem.isNew){
            onFileDelete(editItem.id)
        }
    }
    const clickedItem = useContextMenu([
        {
            label: '打开',
            click: () => {
                const parentElement = getParentNode(clickedItem.current, 'file-item')
                if (parentElement) {
                    onFileClick(parentElement.dataset.id)
                }
            }
        },
        {
            label: '重命名',
            click: () => {
                const parentElement = getParentNode(clickedItem.current, 'file-item')
                if (parentElement) {
                    const { id, title } = parentElement.dataset
                    setEditStatus(id)
                    setValue(title)
                }
            }
        },
        {
            label: '删除',
            click: () => {
                const parentElement = getParentNode(clickedItem.current, 'file-item')
                if (parentElement) {
                    remote.dialog.showMessageBox({
                        type: 'question',
                        buttons:["确认","取消"],
                        title: '删除文档',
                        message: '你确定要删除该文档吗?',
                    }).then(function (msg){
                       if(msg.response === 0){
                           onFileDelete(parentElement.dataset.id)
                       }
                   })
                }
            }
        },
    ], '.file-list', [files])
    useEffect(() => {
        const editItem = files.find(file => file.id === editStatus)

        if (enterPressed && editStatus && value.trim() !== '') {
            onSaveEdit(editItem.id, value,editItem.isNew)
            setEditStatus(false)
            setValue('')
        }
        if (escPressed && editStatus) {
            closeEdit(editItem)
        }
    },[enterPressed,editStatus,escPressed])
    useEffect(() => {

        const newFile = files.find(file=>file.isNew)
        if(newFile){
            setEditStatus(newFile.id)
            setValue(newFile.title)
        }
    },[files])
    useEffect(() => {
        if (editStatus) {
            node.current.focus()
        }
    }, [editStatus])
    return (
        <ul className="list-group list-group-flush file-list">
            {
                files.map(file => (
                    <li className="list-group-item row d-flex align-items-center file-item mx-0 "
                        key={file.id}
                        data-id={file.id}
                        data-title={file.title}
                    >
                        {
                            ((file.id !== editStatus) && !file.isNew) &&
                            <>
                                <span className="col-2"><FontAwesomeIcon title="文档" size={"lg"}
                                                                         icon={faMarkdown}/></span>
                                <span className="col-8" onClick={() => {
                                    onFileClick(file.id)
                                }}>{file.title}</span>
                                {/*<button type="button" className="btn border-0 col-1" onClick={()=>{*/}
                                {/*    startEdit(file.id,file.title)*/}
                                {/*}}>*/}
                                {/*    <FontAwesomeIcon title="编辑" icon={faEdit}/>*/}
                                {/*</button>*/}
                                {/*<button type="button" className="btn border-0 col-1" onClick={() => {*/}
                                {/*    onFileDelete(file.id)*/}
                                {/*}}>*/}
                                {/*    <FontAwesomeIcon title="删除" icon={faTrash}/>*/}
                                {/*</button>*/}
                            </>
                        }
                        {
                            ((file.id === editStatus) && !files.isNew ) &&
                            <>
                                <input
                                    className="border-0 border-bottom border-3 border-grey rounded-0 col-10 "
                                    value={value}
                                    ref={node}
                                    onChange={(e) => {
                                        setValue(e.target.value)
                                    }}
                                />
                                <button
                                    type="button"
                                    className="icon-button col-2 border-0 border-bottom border-3 bg-white border-danger"
                                    onClick={()=>{closeEdit(file)}}
                                >
                                    <FontAwesomeIcon
                                        title="关闭"
                                        size="lg"
                                        icon={faClose}
                                    />
                                </button>
                            </>
                        }
                        {
                            ((file.id !== editStatus) && file.isNew ) &&
                            <>
                                <input
                                    className="border-0 border-bottom border-3 border-grey rounded-0 col-10 "
                                    ref={node}
                                    placeholder={"请输入文档标题"}
                                    onChange={(e) => {
                                        setValue(e.target.value)
                                    }}
                                />
                                <button
                                    type="button"
                                    className="icon-button col-2 border-0 border-bottom border-3 bg-white border-danger"
                                    onClick={()=>{closeEdit(file)}}
                                >
                                    <FontAwesomeIcon
                                        title="关闭"
                                        size="lg"
                                        icon={faClose}
                                    />
                                </button>
                            </>
                        }
                    </li>
                ))
            }
        </ul>
    )
}
FileList.propTypes = {
    files: PropTypes.array,
    onFileClick: PropTypes.func,
    onFileDelete: PropTypes.func,
    onSaveEdit: PropTypes.func,
}
export default FileList