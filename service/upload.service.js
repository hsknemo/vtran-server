const uploadModel = require('../model/upload.model')

class UploadService {
  constructor() {
    this.uploadModel = uploadModel
  }

  async chunkSaveAndUpdate(form) {
    return await this.uploadModel.chunkSaveAndUpdate(form)
  }

  async chunkMerge(form) {
    return await this.uploadModel.chunkMerge(form)
  }
}

module.exports = new UploadService()
