const proxyModule = {}


const CreateProxyKeyValue = function () {
    this.result = []

    this.create = function (key, target, noProxy = false) {
        this.result.push({
            key,
            target,
            noProxy
        })
    }

    this.getResult = function () {
        return this.result
    }
}


var proxyList = new CreateProxyKeyValue()

// 创建代理规则
proxyList.create('/*', 'http://192.168.0.176')
// 导出配置的数组
module.exports = proxyList.getResult()
