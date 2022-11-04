import React, {useState, useEffect} from "react";

import PropTypes from 'prop-types'
import useKeyPress from "../hooks/useKeyPress";
import useContextMenu from '../hooks/useContextMenu'
import { getParentNode } from '../utils/helper'
import {FormControl, InputLabel, OutlinedInput} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';



const remote = window.require("@electron/remote")

const FileList = ({files, onFileClick, onSaveEdit, onFileDelete}) => {
    const [ editStatus, setEditStatus ] = useState(false)
    const [value, setValue] = useState('')
    const enterPressed = useKeyPress(13)
    const escPressed = useKeyPress(27)
    const closeEdit = (editItem) => {
        //e.preventDefault()
        setEditStatus(false)
        setValue('')
        if (editItem.isNew){
            onFileDelete(editItem.id)
            editItem.isNew = false
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
                            ((file.id !== editStatus) ) &&
                            <>
                                <span className="col-10" onClick={() => {
                                    onFileClick(file.id)
                                }}>{file.title}</span>
                            </>
                        }

                        {(file.id === editStatus && !file.isNew ) &&
                            <FormControl fullWidth >
                                <InputLabel>请输入标题</InputLabel>
                                <OutlinedInput
                                    value={value}
                                    onChange={(e) => {
                                        setValue(e.target.value)
                                    }}
                                    endAdornment={<CloseIcon cursor={"pointer"} position="end"
                                                             onClick={() => closeEdit(file)}>$</CloseIcon>}
                                    label="请输入标题"
                                />
                            </FormControl>
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