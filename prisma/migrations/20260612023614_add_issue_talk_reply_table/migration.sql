-- CreateTable
CREATE TABLE `IssueTalkReply` (
    `id` VARCHAR(191) NOT NULL,
    `insertTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `content` LONGTEXT NULL,
    `uploadFilePathArr` LONGTEXT NOT NULL,
    `issueTalkId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
