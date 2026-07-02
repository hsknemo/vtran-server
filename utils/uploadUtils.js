const path = require("path");
const fs = require("fs");

class UploadUtils {
  constructor() {
  }

  async _dropChunkFile(chunkRecord) {
    let chunk_record_id = chunkRecord.id
    let chunk_path_dir = path.join(process.cwd(), `/uploads/chunk/${chunkRecord.toUser}/${chunk_record_id}`)
    fs.rmdirSync(chunk_path_dir, {recursive: true})
  }

  async _createUserDir(mergeConfig, fixUpDir = '') {
    // 创建用户文件夹
    let user_upload_file_path = path.join(process.cwd(), `/uploads/${mergeConfig.userId}`)
    if (fixUpDir) {
      console.log('fixUpDir', fixUpDir)
      user_upload_file_path = fixUpDir
    }
    fs.mkdirSync(`${user_upload_file_path}`, {recursive: true})

    return user_upload_file_path
  }

  async _writeFileStream(fileName, pathArray, user_upload_file_path) {
    let now = Date.now()
    let writeFileName = `${now}_${fileName}`
    let writeStream = fs.createWriteStream(user_upload_file_path + '/' + writeFileName)

    pathArray.sort((a, b) => {
      return a.split('_')[0] - b.split('_')[0]
    })
    for (let i = 0; i < pathArray.length; i++) {
      const chunkBuffer = fs.readFileSync(pathArray[i]);
      writeStream.write(chunkBuffer); // 数据可能还在缓冲区
    }

    writeStream.end();

    return writeFileName
  }
}


module.exports = new UploadUtils()
