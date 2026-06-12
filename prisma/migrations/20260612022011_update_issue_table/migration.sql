/*
  Warnings:

  - Added the required column `issueId` to the `IssueTalk` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `IssueTalk` ADD COLUMN `issueId` VARCHAR(191) NOT NULL;
