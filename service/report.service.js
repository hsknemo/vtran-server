const ReportModel = require('../model/report.model');

class ReportService {
  constructor() {
    this.model = new ReportModel();
  }

  async getReportList(params) {
    return await this.model.getPage(params);
  }

  addReport(params) {
    try {
      console.log('params', params)
      let workList = []
      params.workList.forEach(item => {
        item.timeList.forEach(it => {
          it.title = item.title
          it.reportUser = params.reportUser
          workList.push({
            ...it,
          })
        })

      })

      return this.model.add(workList);
    } catch (e) {
      throw new Error(e)
    }
  }
}

module.exports = ReportService;
