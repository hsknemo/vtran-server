# 1. 备份旧迁移
cp -r prisma/migrations prisma/migrations.bak

# 2. 删除旧迁移文件
rm -rf prisma/migrations/*

# 3. 清空数据库迁移记录
 npx prisma db execute --stdin <<< "DELETE FROM _prisma_migrations;"

# 4. 生成新初始迁移（仅创建文件，不执行）
npx prisma migrate dev --name init --create-only

# 5. 标记新迁移为已应用
npx prisma migrate resolve --applied $(ls prisma/migrations/)

# 查看当前迁移状态，显示正常、无待执行迁移即可
npx prisma migrate status
