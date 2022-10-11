export const flattenArr = (arr) => {
    return arr.reduce((map, item) => {
        map[item.id] = item
        return map
    }, {})
}

// export const objToArr = (obj) => {
//     // return Object.keys(obj).map(key => obj[key])
//     let arr = [];
//     for(let i in obj) {
//         i = parseInt(i)
//         arr[i+1] = obj[i]
//     }
//     return arr
// }
export const objToArr = (obj) => {
    return Object.keys(obj).map(key => obj[key])
}
export const log = (str) => {
    return console.log(str)
}