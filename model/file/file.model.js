const Base = require("../base");
const {resolve} = require("node:path");
const fs = require('fs')

const FileDataStruct = function (o = {}){
  return {
    id: o.id,
    fileName: o.fileName,
    insertTime: o.insertTime,
    toUser: o.toUser,
    fromUser: o.fromUser,
  }
}

class FileModel extends Base {
  constructor() {
    super();
    this.filePath = resolve(__dirname, './file.json')
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async createOrUpdate(file) {
    console.log('进来，，，，', file)
    await this.delay(500)
    let fileModel = await this.getFileData()
    fileModel.push(file)
    await this.save(fileModel)
  }

}

module.exports = {
  FileDataStruct,
  FileModel
}
