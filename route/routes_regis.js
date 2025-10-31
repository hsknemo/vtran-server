const baseFilePath = '../controller'
const CONTROLLER = require('../controller/_main_')

const routes = []

var len = Object.keys(CONTROLLER)
for (let i = 0; i < len.length; i++) {
    routes.push(CONTROLLER[len[i]])
}
if (!routes.length) { 
    console.log({
        routesTip: '导出的模块为空，请检查是否已经配置正确'
    })    
}

module.exports = routes