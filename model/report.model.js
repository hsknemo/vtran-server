const prisma = require("../config/prisma");

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

  getPage(form) {
    return prisma.report.findMany({
      where: {
        reportUser: form.userId
      },
      take: form.pageSize,
      skip: (form.page - 1) * form.pageSize,
    });
  }

}


module.exports = ReportModel
