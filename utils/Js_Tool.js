
const fs = require('fs');
const path = require('path');
const {sql} = require("../config/mysql");
const moment = require("moment");
const {ERROR} = require("../_requestResponse/setResponse");

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

const delay = async ms => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}


/**
 * 创建多级目录并保存文件块
 */
function saveFileChunk({ baseDir, md5Key, userId, chunkIndex, chunkData, time, chunkLastPrefix = '' }) {
  const userPath = path.join(baseDir, `${userId}`);
  const md5Path = path.join(userPath, md5Key);
  fs.mkdirSync(md5Path, { recursive: true });

  const chunkFileName = `${chunkIndex}_${md5Key}_${time}` + `${chunkLastPrefix}`;
  const chunkWritePath = path.join(md5Path, chunkFileName);

  fs.writeFileSync(chunkWritePath, chunkData, "binary");

  return chunkWritePath;
}

// 提取为公共函数
function sendFileDownloadResponse(res, stream, filename, fileSize) {
  const encodedFilename = encodeURI(filename);
  const contentDisposition = `attachment;filename=${encodedFilename}`;

  res.setHeader('Content-Disposition', contentDisposition);
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Length', fileSize);
  stream.pipe(res);

  stream.on('error', (err) => {
    res.status(500).json(ERROR('File not found or read error'));
  });

  res.on('close', () => {
    if (!stream.destroyed) {
      stream.destroy();
    }
  });
}


module.exports = {
  isObj,
  treeConstructor,
  objHasLength,
  writeAppendSql,
  getRandomStr,
  delay,
  saveFileChunk,
  sendFileDownloadResponse,
}
