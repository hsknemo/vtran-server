const route_list = require('../controller/_main_')

const define_test_type = require('./define.test.type')

/**
 *
 * @param moduleName
 * @param apiPath
 */
const testModuleIsExist = function (moduleName, apiPath) {
  let route_arr = route_list[moduleName]
  if (!route_arr || (Array.isArray(route_arr) && !route_arr.length)) {
    console.log(define_test_type.api.module_null)
  }
  let filterArr = route_arr.filter(item => item.path === apiPath)
  if (!filterArr.length) {
    console.log(define_test_type.api.module_path_null)
  } else {
    console.log(`接口：【${apiPath}】` + define_test_type.api.module_path_test_success)
  }
}


module.exports = {
  testApi: {
    testModuleIsExist
  }
}
