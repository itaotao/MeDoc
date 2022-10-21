import React, {useEffect, useState,} from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faSearch,faClose} from '@fortawesome/free-solid-svg-icons'
import PropTypes from 'prop-types'
import useKeyPress from "../hooks/useKeyPress";
import useIpcRenderer from "../hooks/useIpcRenderer";


const FileSearch = ({title,onFileSearch}) => {
    const [inputActive, setInputActive] = useState(false)
    const [value, setValue]  = useState('')
    const enterPressed = useKeyPress(13)
    const escPressed = useKeyPress(27)
    const startSearch = () => {
        setInputActive(true)
    }
    const closeSearch = () => {
        setInputActive(false)
        setValue('')
        onFileSearch('')
    }
    useEffect( () => {
        if(enterPressed && inputActive){
            onFileSearch(value)
        }
        if (escPressed && inputActive){
            closeSearch()
        }
    },[enterPressed,escPressed,inputActive])
    useIpcRenderer({
        'search-file'     : startSearch,
    })
    return (
        <div className="alert alert-primary d-flex justify-content-between align-items-center mb-0">
            {
                !inputActive &&
                <>
                    <span>{title}</span>
                    <button
                        type="button"
                        className="icon-button border-0 rounded-0 "
                        onClick={startSearch}
                    >
                        <FontAwesomeIcon
                            title="搜索"
                            size="lg"
                            icon={faSearch}
                        />
                    </button>
                </>
            }
            { inputActive &&
                <>
                    <input
                        className="form-control"
                        placeholder="按enter回车键搜索"
                        value={value}
                        onChange={(e) => { setValue(e.target.value) }}
                    />
                    <button
                        type="button"
                        className="icon-button border-0"
                        onClick={closeSearch}
                    >
                        <FontAwesomeIcon
                            title="关闭"
                            size="lg"
                            icon={faClose}
                        />
                    </button>
                </>
            }
        </div>
    )
}
FileSearch.propTypes = {
    title: PropTypes.string,
    onFileSearch: PropTypes.func.isRequired,
}
FileSearch.defaultProps = {
    title:'我的文档'
}
export default FileSearch