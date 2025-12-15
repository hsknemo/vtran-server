/*
 * @Example
 */
const BaseValidator = require("./baseValidator");

class StringValidator extends BaseValidator{
  constructor(options = {}) {
    super()
    this.value = options.value
    this.range = options.range || { max: 0, min: 0 }
    this.reg = options.reg || null
  }

  isString() {
    this.typeValidator(this.value, 'String')
    return this
  }

  len() {
    return this.lenValidetor(this.value, this.range)
  }

  notEmpty() {
    if (this.value === '') {
      this.errorCollection.push(`值不能为空`)
      return this.showError()
    }
    return this
  }

  regExp() {
    if (this.reg) {
      if (!this.reg.test(this.value)) {
        this.errorCollection.push(`${this.value} 不符合正则`)
        return this.showError()
      }
    }
    return this
  }
}

module.exports = StringValidator
