
const fs = require('fs');
const path = require('path');
const {sql} = require("../config/mysql");
const moment = require("moment");

const isObj = function(params) {
  return Object.prototype.toString.call(params) === '[object Object]'
}

const objHasLength = form => {
  return Object.keys(form).length > 0
}

/**
 * 输出sql 到文件
 * @param sqlString
 */
const writeAppendSql = async function(sqlString) {
  let writePath = path.join(__dirname, `../debug/sql/writeSql.${moment().format('YYYYMMDDHHmmss')}.txt`)
  let isFile = fs.existsSync(writePath)
  if (!isFile) {
    fs.writeFileSync(writePath, '', 'utf8')
  }
  let ifFileContent = fs.readFileSync(writePath, 'utf8')
  if (ifFileContent) {
    let { size } = await fs.statSync(writePath)
    console.log(size, 'writePath size')
    // 3M 文件重新生成写入
    if (size / 1024 / 1024 < 3) {
      fs.writeFileSync(writePath, sqlString + '\n\n\n', 'utf-8')
      return
    }
    let pinStr = ifFileContent + '\n\n\n' +  sqlString
    fs.appendFileSync(writePath, pinStr, 'utf-8')
  } else {
    fs.writeFileSync(writePath, sqlString + '\n\n\n', 'utf-8')
  }
}

const treeConstructor = function(data) {
  if (!Array.isArray(data)) {
    return []
  }
  // 找到父级

  data.forEach(item =>{
    item.children = item.children || []
    data.forEach(pItem => {
      if (item.setMark) return
      if (pItem.id === item.fid) {
        pItem.children = pItem.children || []
        pItem.children.push(item)
        item.setMark = true
      }
    })
  })

  return data.filter(item => item.mark === 'main')
}

// 获取6位数
const getRandomStr = () => {
  let str = `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`
  str = str.split('').sort(() => Math.random() - 0.5).join('')
  str = str.slice(0, 6)
  return str
}

module.exports = {
  isObj,
  treeConstructor,
  objHasLength,
  writeAppendSql,
  getRandomStr,
}
