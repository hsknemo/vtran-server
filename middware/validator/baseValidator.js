module.exports = class BaseValidator {
  constructor() {
    this.errorCollection = [];
  }

  typeValidator(val, type='String') {
      // 更健壮的类型判断，兼容 null/undefined
      if (val === null || val === undefined) return false;
      console.log(Object.prototype.toString.call(val))
      let isType = Object.prototype.toString.call(val) === `[object ${type}]`;
      if (!isType) {
        this.errorCollection.push(`${val} is not a ${type}`)
        this.showError()
      }
      return this
  }


  showError() {
    if (this.errorCollection.length) {
      throw new Error(this.errorCollection[0]);
    }
    return this
  }

  lenValidetor(val, range = { max: 0, min: 0 }) {
    if (range.max) {
      if (val.length > range.max) {
        this.errorCollection.push(`长度不能大于${range.max}`)
      }
    }
    if (range.min) {
      if (val.length < range.min) {
        this.errorCollection.push(`长度不能小于${range.min}`)
      }
    }
    return this.showError()
  }
}
