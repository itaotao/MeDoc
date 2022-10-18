const fs = window.require('fs')
export const flattenArr = (arr) => {
    return arr.reduce((map, item) => {
        map[item.id] = item
        return map
    }, {})
}

export const objToArr = (obj) => {
    return Object.keys(obj).map(key => obj[key])
}
export const log = (str) => {
    return console.log(str)
}
export const getParentNode = (node, parentClassName) => {
    let current = node
    while(current !== null) {
        if (current.classList.contains(parentClassName)) {
            return current
        }
        current = current.parentNode
    }
    return false
}

export const timestampToString = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}
export const existFile = (path)=>{

    // return  fs.access(path,function (err){
    //     // log(!err)
    // }).then(function (err){
    //     // console.log(err)
    // })
    // console.log(msg)
try {
   fs.open(path);

}catch (err){
    if (err){
        console.log('err')
    }
}


}