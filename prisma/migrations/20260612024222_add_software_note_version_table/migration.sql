-- CreateTable
CREATE TABLE `Note` (
    `id` VARCHAR(191) NOT NULL,
    `insertTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `name` VARCHAR(191) NOT NULL,
    `desc` VARCHAR(191) NOT NULL,
    `updateTime` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `searchable` BOOLEAN NOT NULL,
    `markColor` VARCHAR(191) NOT NULL,
    `contentUrl` LONGTEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Software` (
    `id` VARCHAR(191) NOT NULL,
    `insertTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `appUploadUser` VARCHAR(191) NOT NULL,
    `appName` VARCHAR(191) NOT NULL,
    `appDesc` DATETIME(3) NOT NULL,
    `appCategory` VARCHAR(191) NOT NULL,
    `appRealName` LONGTEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Version` (
    `id` VARCHAR(191) NOT NULL,
    `insertTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `versionTitle` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VersionList` (
    `id` VARCHAR(191) NOT NULL,
    `insertTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `versionId` VARCHAR(191) NOT NULL,
    `versionType` VARCHAR(191) NOT NULL,
    `versionContent` LONGTEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
