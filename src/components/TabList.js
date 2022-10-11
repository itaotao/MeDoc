import React from 'react'
import PropTypes from 'prop-types'
import classNames from "classnames";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faClose} from '@fortawesome/free-solid-svg-icons'
import './TabList.scss'
const TabList = ({files,activeId,unSaveIds,onTabClick,onCloseTab}) =>{
    return (
                <ul className="nav nav-pills tablist-component">
                    { files.map( file => {
                        const  withUnsavedMark = unSaveIds.includes(file.id)
                        const fClassName = classNames({
                                'nav-link': true,
                                'active': file.id === String(activeId),
                                'withUnsaved': withUnsavedMark,
                        }
                        )
                        return (
                            <li className="nav-item " key={file.id}>
                                <a  className={fClassName} href="#"
                                onClick={(e)=>{e.preventDefault();onTabClick(file.id)}}>{file.title}
                                    <span className="ms-2 close-icon">
                                        <FontAwesomeIcon
                                        title="关闭"
                                        icon={faClose}
                                        onClick={(e)=>{e.stopPropagation();onCloseTab(file.id)}}
                                    /></span>
                                    { withUnsavedMark && <span className="rounded-circle ms-2 unsaved-icon"> </span>}
                                </a>
                            </li>
                        )
                    })

                    }
                </ul>
    )

}
TabList.propTypes = {
    files : PropTypes.array,
   // activeId : PropTypes.string,
    unSaveIds : PropTypes.array,
    onTabClick : PropTypes.func,
    onCloseTab: PropTypes.func,
}
TabList.defaultProps = {
    unSaveIds: []
}
export default TabList