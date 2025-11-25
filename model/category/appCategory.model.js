const Base = require('../base.model');
const {resolve, join} = require("node:path");
const moment = require("moment");
const crypto = require("crypto");

const DefineCategoryModel = function (obj) {
  return {
    id: crypto.randomUUID(),
    insertTime: moment().format('YYYY-MM-DD HH:mm:ss'),
    categoryName: obj.categoryName,
    categoryCreateUser: obj.categoryCreateUser
  }
}

class AppCategoryModel extends Base {
  constructor() {
    super();
    this.filePath = resolve(__dirname, './appCategory.json')
  }

  async getCategoryList() {
    return await this.getModelData()
  }

  async saveCategory(category) {
    let categoryModel = await this.getCategoryList()
    categoryModel.filter(item => {
      if (item.categoryName === category.categoryName) {
        throw new Error('分类已存在')
      }
    })
    categoryModel.push(new DefineCategoryModel(category))
    await this.save(categoryModel)
    return '分类创建成功'
  }
}

module.exports = {
  appCategoryModel: AppCategoryModel.new(),
}
