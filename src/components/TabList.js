import React from 'react'
import PropTypes from 'prop-types'
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CloseIcon from '@mui/icons-material/Close';
import CircleIcon from '@mui/icons-material/Circle';

const TabList = ({files, activeId, unSaveIds, onTabClick, onCloseTab}) => {
    return (
        <Box>
            <Tabs
                value={activeId}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
            >
                {files.map(file => {
                    const withUnsavedMark = unSaveIds.includes(file.id)
                    return (

                        <Tab
                            label={
                                <Box sx={{fontWeight: 'bold', textTransform: 'none'}}>
                                    {file.title}
                                    {!withUnsavedMark &&
                                        <Box
                                            component="span"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onCloseTab(file.id)
                                            }}
                                        >
                                            <CloseIcon sx={{
                                                margin: "-5px 0px 0px 5px",
                                                color: "#C0C0C0",
                                                width: "13px",
                                                height: "13px"
                                            }}/>
                                        </Box>}
                                    {withUnsavedMark && <CircleIcon sx={{
                                        margin: "-3px 0px 0px 5px",
                                        color: "#d9534f",
                                        width: "11px",
                                        height: "11px"
                                    }}/>}
                                </Box>
                            }
                            key={file.id} value={file.id} onClick={(e) => {
                            e.preventDefault();
                            onTabClick(file.id)
                        }}
                        />


                    )
                })

                }
            </Tabs>
        </Box>
    )

}
TabList.propTypes = {
    files: PropTypes.array,
    // activeId : PropTypes.string,
    unSaveIds: PropTypes.array,
    onTabClick: PropTypes.func,
    onCloseTab: PropTypes.func,
}
TabList.defaultProps = {
    unSaveIds: []
}
export default TabList