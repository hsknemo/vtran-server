const prisma = require("../config/prisma");
const moment = require("moment");

class ReportModel {

  constructor() {
  }

  async add(formList = []) {
    formList.forEach(item => item.id = crypto.randomUUID())
    return prisma.report.createMany({
      data: formList,
      skipDuplicates: true
    })
  }

  getQuery(form) {
    let query =  {
      where: {
        reportUser: form.userId
      },

      orderBy: {
        insertTime: 'desc'
      }
    }
    let OR = []

    if (form.page && form.pageSize) {
      query = Object.assign({}, query, {
        take: form.pageSize,
        skip: (form.page - 1) * form.pageSize,
      })
    }

    if (form.reportName) {
      OR.push({
        reportName: {
          contains: form.reportName
        }
      })
    }

    if (form.reportDesc) {
      OR.push({
        reportDesc: {
          contains: form.reportDesc
        }
      })
    }

    if (form.range && form.range.length === 2) {
      query.where.title = {
        gte: moment(form.range[0]).toISOString(),
        lte: moment(form.range[1]).toISOString()
      }
    }

    if (OR.length) {
      query.where.OR = OR
    }

    return query
  }

  async exportReportFile(form) {
    let query = this.getQuery(form)
    const listOrm = prisma.report.findMany(query)
    const dictOrm = prisma.dict.findMany({
      where: {
        groupName: '日报项目',
      }
    })

    const [list, dictList] = await Promise.all([listOrm, dictOrm])
    console.log(dictList, 'dictList')
    list.forEach(it => {
      it.reportName = dictList.find(it2 => it2.code === it.reportName)?.name
    })

    return list
  }

  async getPage(form) {
    let query = this.getQuery(form)

    const listOrm = prisma.report.findMany(query)
    const countOrm = prisma.report.count({
      where: query.where
    })
    const [list, total] = await Promise.all([listOrm, countOrm])

    return {
      list,
      total,
      page: form.page,
      pageSize: form.pageSize
    }
  }

}


module.exports = ReportModel
