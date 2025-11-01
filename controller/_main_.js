


const routes = []
const path = require('path')
const exportsController = require(path.resolve(__dirname,'./controllerConfig/controllerExport.config'))
// 需要导出的文件配置
const includes = exportsController

const CreateRoutes = function () {
    const fs = require('fs')
    const result = fs.readdirSync(path.resolve(__dirname))
    this.result = {}
    this.init = function () {
        result.forEach(element => {
            const splitPath = element.split('.js')[0]
            // 隔离引出文件
            if (includes.includes(splitPath)) {
                this.result[splitPath] = require(`./${element}`)
            }
        });
        return this.result
    }
    return this.init()
}
const oRoutesResult = CreateRoutes()

module.exports = oRoutesResult
