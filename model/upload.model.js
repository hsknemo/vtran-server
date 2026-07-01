const prisma = require("../config/prisma")

class UploadModel {
  constructor() {
    this.uploadUtls = require("../utils/uploadUtils")
    this.tip = {
      'no-merge-file': '合并文件不存在!',
      'file-desc-error': '文件上传不完整！无法合并',
      'no-chunk': '系统错误， 分片失败',
      'merge-success': '合并成功',
      'merge-error': '合并失败',
    }
  }

  async chunkSaveAndUpdate(form) {
    let fileIsUploaded = false

    let currentChunk = await prisma.fileChunk.findFirst({
      where: {
        id: form.id
      }
    })

    if (!currentChunk) {
      let set = new Set([form.chunkPath])
      if (Number(form.chunkSliceNum) === set.size) {
        fileIsUploaded = true
      }
      await prisma.fileChunk.create({
        data: {
          id: form.id,
          fileName: form.fileName,
          toUser: form.toUser,
          fromUser: form.fromUser,
          chunkTotalLen: parseFloat(form.chunkTotalLen),
          fileIsUploaded: fileIsUploaded,
          chunkPathArr: JSON.stringify([form.chunkPath]),
        }
      })
    } else {
      await prisma.fileChunk.update({
        where: {
          id: form.id
        },
        data: {
          chunkPathArr: JSON.stringify([...currentChunk.chunkPathArr, form.chunkPath]),
          fileIsUploaded: Number(form.chunkSliceNum) === currentChunk.chunkPathArr.length + 1
        }
      })
    }

    return {
      fileIsUploaded: fileIsUploaded
    }
  }

  async chunkMerge(mergeConfig, fixUpDir = '') {
    let currentChunk = await prisma.fileChunk.findFirst({
      where: {
        id: mergeConfig.md5Key
      }
    })

    if (!currentChunk) {
      throw new Error(this.tip["no-merge-file"])
    }

    if (!currentChunk.fileIsUploaded) {
      throw new Error(this.tip["file-desc-error"])
    }

    if (!currentChunk.chunkPathArr) {
      throw new Error(this.tip["no-chunk"])
    }

    let user_upload_file_path = await this.uploadUtls._createUserDir(mergeConfig, fixUpDir)

    try {
      // 读取记录文件流合并
      let writeFileName = await this.uploadUtls._writeFileStream(currentChunk.fileName, JSON.parse(currentChunk.chunkPathArr), user_upload_file_path)
      // 删除chunk 文件
      await this.uploadUtls._dropChunkFile(currentChunk)

      // chunk 记录清理
      await prisma.fileChunk.delete({
        where: {
          id: currentChunk.id
        }
      })
      return {
        msg: this.tip["merge-success"],
        fileName: writeFileName
      }
    } catch (e) {
      console.log(`【error: 】${e} ${currentChunk.fileName}------合并失败`)
      throw new Error(this.tip["merge-error"])
    }

  }
}

module.exports = new UploadModel()
