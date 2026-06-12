-- CreateTable
CREATE TABLE `FileChunk` (
    `id` VARCHAR(191) NOT NULL,
    `insertTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fileName` LONGTEXT NULL,
    `toUser` VARCHAR(191) NOT NULL,
    `fromUser` VARCHAR(191) NOT NULL,
    `chunkTotalLen` INTEGER NOT NULL,
    `updateTime` DATETIME(3) NOT NULL,
    `fileIsUploaded` BOOLEAN NOT NULL,
    `chunkPathArr` LONGTEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
