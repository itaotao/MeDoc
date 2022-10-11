import React, {useState, useEffect} from "react";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faEdit, faTrash, faClose} from '@fortawesome/free-solid-svg-icons'
import {faMarkdown} from "@fortawesome/free-brands-svg-icons";
import PropTypes from 'prop-types'
import useKeyPress from "../hooks/useKeyPress";


const FileList = ({files, onFileClick, onSaveEdit, onFileDelete}) => {
    const [ editStatus, setEditStatus ] = useState(false)
    const [value, setValue] = useState('')
    const enterPressed = useKeyPress(13)
    const escPressed = useKeyPress(27)
    const startEdit = (id,value) => {

        setEditStatus(id)
        setValue(value)
    }
    const closeEdit = (editItem) => {
        //e.preventDefault()
        setEditStatus(false)
        setValue('')
        if (editItem.isNew){
            onFileDelete(editItem.id)
        }
    }
    useEffect(() => {
        const editItem = files.find(file => file.id === editStatus)

        if (enterPressed && editStatus && value.trim() !== '') {
            onSaveEdit(editItem.id, value)
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
    return (
        <ul className="list-group list-group-flush file-list">
            {
                files.map(file => (
                    <li className="list-group-item row d-flex align-items-center file-item mx-0 "
                        key={file.id}
                    >
                        {
                            ((file.id !== editStatus) && !file.isNew) &&
                            <>
                                <span className="col-2"><FontAwesomeIcon title="文档" size={"lg"}
                                                                         icon={faMarkdown}/></span>
                                <span className="col-8" onClick={() => {
                                    onFileClick(file.id)
                                }}>{file.title}</span>
                                <button type="button" className="btn border-0 col-1" onClick={()=>{
                                    startEdit(file.id,file.title)
                                }}>
                                    <FontAwesomeIcon title="编辑" icon={faEdit}/>
                                </button>
                                <button type="button" className="btn border-0 col-1" onClick={() => {
                                    onFileDelete(file.id)
                                }}>
                                    <FontAwesomeIcon title="删除" icon={faTrash}/>
                                </button>
                            </>
                        }
                        {
                            ((file.id === editStatus) || file.isNew ) &&
                            <>
                                <input
                                    className="border-0 border-bottom border-3 border-grey rounded-0 col-10 "
                                    value={value}
                                    placeholder={"请输入文档标题"}
                                    onChange={(e) => {
                                        setValue(e.target.value)
                                    }}
                                />
                                <button
                                    type="button"
                                    className="icon-button col-2 border-0 border-bottom border-3 bg-white border-danger"
                                    onClick={closeEdit}
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