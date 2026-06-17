const prisma = require("../config/prisma")

class DictModel {
  constructor() {
  }

  async addDict(formDict) {
    let f = await prisma.dict.findFirst({
      where: {
        code: formDict.code,
        groupName: formDict.groupName
      }
    })

    if (f) {
      console.log(f)
     throw new Error('字典值已存在！')
    }

    return prisma.dict.create({
      data: formDict
    });
  }

  async dictList(filterProp) {
    let skip = (filterProp.page - 1) * filterProp.pageSize
    let name = typeof filterProp.name === 'string' ? filterProp.name.trim() : ''
    let groupName = typeof filterProp.groupName === 'string' ? filterProp.groupName.trim() : ''
    let orWhere = []

    if (name) {
      orWhere.push({ name: { contains: name } })
    }

    if (groupName) {
      orWhere.push({ groupName: { contains: groupName } })
    }

    let query = {
      orderBy: {
        insertTime: 'desc'
      },
      skip,
      take: filterProp.pageSize
    }

    if (orWhere.length) {
      query.where = {
        OR: orWhere
      }
    }

    let listOrm = prisma.dict.findMany(query)
    let countOrm = prisma.dict.count({
      where: query.where
    })
    const [list, total] = await Promise.all([listOrm, countOrm])
    return {
      list,
      total,
      page: filterProp.page,
      pageSize: filterProp.pageSize
    }
  }
}

module.exports = DictModel
