import React, {useEffect,  useState,} from "react";
import PropTypes from 'prop-types'
import useKeyPress from "../hooks/useKeyPress";
import useIpcRenderer from "../hooks/useIpcRenderer";
import {ThemeProvider} from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import PostAddIcon from '@mui/icons-material/PostAdd';
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";
import {alpha, createTheme, InputBase, styled} from "@mui/material";

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#434343',
        },
    },
});
const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(1),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: '12ch',
            '&:focus': {
                width: '20ch',
            },
        },
    },
}));


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

            <ThemeProvider theme={darkTheme}>
                <AppBar position="static">
                    <Toolbar>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="open drawer"
                            sx={{ mr: 2 }}
                        >
                            <PostAddIcon />
                        </IconButton>
                        <Typography
                            variant="h6"
                            noWrap
                            component="div"
                            sx={{ flexGrow: 1, color: 'rgb(135,147,154)',display: { xs: 'none', sm: 'block' } }}
                        >
                            MeDoc
                        </Typography>
                        <Search >
                            <SearchIconWrapper >
                                <SearchIcon  />
                            </SearchIconWrapper>
                            <StyledInputBase
                                placeholder="搜索文档…"
                                inputProps={{ 'aria-label': 'search'}}
                                onFocus = {startSearch}
                                onBlur = {closeSearch}
                                onChange={(e) => { setValue(e.target.value) }}
                                value = {value}
                            />
                        </Search>
                    </Toolbar>
                </AppBar>
            </ThemeProvider>
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