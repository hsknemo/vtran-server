const {SUCCESS, ERROR} = require("../_requestResponse/setResponse");
const {AUTHORIZATION} = require("../middware/Authorization");
const {validatorMiddleware} = require("../middware/Validator");
const ReportService = require("../service/report.service");
const routeName = 'report'
const reportService = new ReportService()
const addFunc = async (req, res) => {
  try {
    let report = req.body
    console.log(req.tokenResolveResult, 'reportUser:')
    report.reportUser = req.tokenResolveResult.id
    await reportService.addReport(report)
    res.send(SUCCESS())
  } catch (e) {
    res.send(ERROR(e.message))
  }
}
const add = {
  method: 'post',
  path: `/${routeName}/add`,
  func: addFunc,
  midFun: [AUTHORIZATION, validatorMiddleware(req => ({
    workList: {
      type: 'Array',
      required: true,
      message: '工作项必填',
      value: req.body.workList
    },
  }))]
}
module.exports = [
  add,
]
