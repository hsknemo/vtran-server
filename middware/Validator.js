const typeValidor = function(val, type) {
    // 更健壮的类型判断，兼容 null/undefined
    if (val === null || val === undefined) return false;
    return Object.prototype.toString.call(val) === `[object ${type}]`;
}

const NumberSet = new Set([0]);

class Validator {
    constructor(args) {
        this.valideMap = args.valideMap || {};
        this.errorCollection = [];
    }

    runError() {
        // 只抛出第一个错误，防止信息泄露
        let errMsg = this.errorCollection[0];
        throw new Error(errMsg);
    }

    valideListAction() {
        for (let key in this.valideMap) {
            const item = this.valideMap[key];
            // 验证必填
            if (item.required) {
                // 0、false、''等都允许，只有 null/undefined/NaN/空字符串才报错
                if (item.value === undefined || item.value === null || (typeof item.value === 'string' && item.value.trim() === '')) {
                    // 0 的问题
                    if (item.type === 'Number' && NumberSet.has(item.value)) {
                        continue;
                    }
                    this.errorCollection.push(`${key}不能为空`);
                }
            }
            // 验证类型
            if (item.type && item.value !== undefined && item.value !== null) {
                if (!typeValidor(item.value, item.type)) {
                    this.errorCollection.push(`${key}值类型错误 需要类型为 ${item.type}`);
                }
            }
            if (this.errorCollection.length) {
                this.runError();
                break;
            }
        }
    }
}

// Express表单验证中间件工厂
function validatorMiddleware(valideMapFactory) {
    return (req, res, next) => {
        let valideMap = typeof valideMapFactory === 'function' ? valideMapFactory(req) : valideMapFactory;
        const validator = new Validator({ valideMap });
        try {
            validator.valideListAction();
            next();
        } catch (err) {
            // 返回400错误，防止信息泄露
            res.status(400).json({ code: 400, msg: err.message });
        }
    };
}

module.exports = { Validator, validatorMiddleware };
