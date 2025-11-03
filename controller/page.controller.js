const { ERROR } = require("../_requestResponse/setResponse");
const main_index_func = async (req, res) => {
  try {
    res.render('index')
  } catch (e) {
    res.send(ERROR(e.message))
  }
}
const main_index = {
  method: 'get',
  path: `/`,
  func: main_index_func,
  desc: '首页'
}

module.exports = [
  main_index
]
