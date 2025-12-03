/**
 * 分类模块
 */
const {appCategoryModel} = require("../model/category/appCategory.model");
const {SUCCESS, ERROR} = require("../_requestResponse/setResponse");
const {AUTHORIZATION} = require("../middware/Authorization");
const {validatorMiddleware} = require("../middware/Validator");

const routeName = '/category'

const category_list_func = async (req, res) => {
  try {
    let categoryList = await appCategoryModel.getCategoryList()
    res.send(SUCCESS(categoryList))
  } catch (e) {
    res.send(ERROR(e.message))
  }
}
const category_list = {
  method: 'get',
  path: `${routeName}/list`,
  midFun: [AUTHORIZATION],
  func: category_list_func,
}

const category_add_func = async (req, res) => {
  try {
    let category = req.body
    category.categoryCreateUser = req.Token解析结果.id
    await appCategoryModel.saveCategory(category)
    res.send(SUCCESS())
  } catch (e) {
    res.send(ERROR(e.message))
  }
}
const category_add = {
  method: 'post',
  path: `${routeName}/add`,
  midFun: [AUTHORIZATION, validatorMiddleware(req => ({
    categoryName: {
      type: 'String',
      required: true,
      message: '请输入分类名称',
      value: req.body.categoryName
    }
  }))],
  func: category_add_func
}
module.exports = [
  category_list,
  category_add,
]
