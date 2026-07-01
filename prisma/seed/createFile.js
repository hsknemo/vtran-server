const prisma = require('../../config/prisma')
const faker = require('faker')
const crypto = require('crypto')
async function main() {
  console.log('开始清空旧数据...')
  // 先清空表（按需开启）
  await prisma.file.deleteMany({})

  const batchSize = 50 // 一批插入50条
  const total = 200    // 总共造200条
  const file = []

  for (let i = 0; i < total; i++) {
    file.push({
      fileName: faker.lorem.text() + i,
      toUser: faker.company.companyName() + '\_' + i,
      fromUser: faker.music.genre() + '\_' + i,
      id: crypto.randomUUID()
    })

    // 分批写入，避免单次数组过大报错
    if (file.length >= batchSize) {
      await prisma.file.createMany({ data: file, skipDuplicates: true })
      file.length = 0
      console.log(`已插入 ${i + 1} 条`)
    }
  }

  // 插入剩余不足一批的数据
  if (file.length > 0) {
    await prisma.file.createMany({ data: file, skipDuplicates: true })
  }

  console.log(`✅ 全部 ${total} 条file数据创建完成`)
}

main()
