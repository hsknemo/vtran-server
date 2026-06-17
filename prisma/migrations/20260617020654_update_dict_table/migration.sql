/*
  Warnings:

  - You are about to drop the `ReportDict` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `ReportDict`;

-- CreateTable
CREATE TABLE `Dict` (
    `id` VARCHAR(191) NOT NULL,
    `insertTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
