const ReportModel = require('../model/report.model');
const ExcelJS = require('exceljs');

class ReportService {
  constructor() {
    this.model = new ReportModel();
  }

  async getReportList(params) {
    return this.model.getPage(params);
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

  async exportReportFile(form) {
    let data = await this.model.exportReportFile(form);
    // 2. 创建工作簿 + 工作表
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('数据列表');

    worksheet.mergeCells(1, 1, 1, 3);
    const titleCell = worksheet.getCell(1, 1);
    titleCell.value = '字典分组汇总统计表';
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' }; // 居中
    titleCell.font = { size: 14, bold: true };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid', // 纯色填充固定写 solid
      fgColor: { argb: 'ff000000' }
    }

    // 3. 表头
    worksheet.columns = [
      { header: '日期', key: 'date', width: 10 },
      { header: '工作内容', key: 'reportDesc', width: 20, height: 100},
      { header: '项目梗概', key: 'reportName', width: 25 },
    ];
    const rows = []
    let map = new Map()
    data.forEach(item => {
      if (!map.has(item.title)) {
        map.set(item.title, [item])
      } else {
        map.get(item.title).push(item)
      }
    })
    map.forEach((item, key) => {
      let desc = {}
      item.forEach((it) => {
        if (!desc[it.reportName]) {
          desc[it.reportName] = it.reportDesc
          return
        }
        desc[it.reportName] += `\n${it.reportDesc}`
      })

      let lastRes = []
      for (const descKey in desc) {
        lastRes.push(`【${descKey}】 \n ` + desc[descKey])
      }

      rows.push({
        date: key,
        reportDesc: lastRes.join('\n'),
        reportName: Array.from(new Set(item.map(it => `【${it.reportName}】`))).join('\n'),
      })
    })

    // 填充行数据
    worksheet.addRows(rows);
    const stream = await workbook.xlsx.writeBuffer();
    return stream
  }
}

module.exports = ReportService;
