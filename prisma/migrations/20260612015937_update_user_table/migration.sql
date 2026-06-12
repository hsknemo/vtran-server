/*
  Warnings:

  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - Added the required column `heartbeat` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ip` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updateTime` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `name`,
    ADD COLUMN `heartbeat` DATETIME(3) NOT NULL,
    ADD COLUMN `insertTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `ip` VARCHAR(191) NOT NULL,
    ADD COLUMN `updateTime` DATETIME(3) NOT NULL,
    ADD COLUMN `username` VARCHAR(191) NOT NULL;
