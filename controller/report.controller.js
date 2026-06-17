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


const pageFunc = async (req, res) => {
  try {
    let page = req.body
    page.userId = req.tokenResolveResult.id
    let d = await reportService.getReportList(page)
    res.send(SUCCESS(d))
  } catch (e) {
    res.send(ERROR(e.message))
  }
}
const list = {
  method: 'post',
  path: `/${routeName}/list`,
  func: pageFunc,
  midFun: [AUTHORIZATION]
}

const exportReportFileFunc = async (req, res) => {
  try {
    const fileName = encodeURIComponent('日报.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    let page = req.body
    page.userId = req.tokenResolveResult.id
    let stream = await reportService.exportReportFile(page)
    // res.send(SUCCESS(stream.toString('base64')))
    res.end(stream)
  } catch (e) {
    res.send(ERROR(e.message))
  }
}
const exportReportFile = {
  method: 'post',
  path: `/${routeName}/export`,
  func: exportReportFileFunc,
  midFun: [AUTHORIZATION]
}

module.exports = [
  add,
  list,
  exportReportFile,
]
