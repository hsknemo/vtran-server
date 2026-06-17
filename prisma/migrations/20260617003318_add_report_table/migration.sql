-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `insertTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateTime` DATETIME(3) NOT NULL,
    `ip` VARCHAR(191) NULL,
    `heartbeat` DATETIME(3) NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` VARCHAR(191) NOT NULL,
    `insertTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `categoryName` VARCHAR(191) NOT NULL,
    `categoryCreateUser` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ding` (
    `id` VARCHAR(191) NOT NULL,
    `insertTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dingMsg` LONGTEXT NULL,
    `toUser` VARCHAR(191) NOT NULL,
    `fromUser` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `File` (
    `id` VARCHAR(191) NOT NULL,
    `insertTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fileName` LONGTEXT NULL,
    `toUser` VARCHAR(191) NOT NULL,
    `fromUser` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- CreateTable
CREATE TABLE `ChatGroup` (
    `id` VARCHAR(191) NOT NULL,
    `insertTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `groupName` VARCHAR(191) NOT NULL,
    `groupCreateUser` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChatGroupMessage` (
    `id` VARCHAR(191) NOT NULL,
    `insertTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `groupId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `content` LONGTEXT NULL,
    `filePath` LONGTEXT NULL,
    `contentType` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChatGroupUser` (
    `id` VARCHAR(191) NOT NULL,
    `insertTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `groupId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Issue` (
    `id` VARCHAR(191) NOT NULL,
    `insertTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `issueType` VARCHAR(191) NOT NULL,
    `createUser` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IssueTalk` (
    `id` VARCHAR(191) NOT NULL,
    `insertTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `content` LONGTEXT NULL,
    `uploadFilePathArr` LONGTEXT NOT NULL,
    `issueId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IssueTalkReply` (
    `id` VARCHAR(191) NOT NULL,
    `insertTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `content` LONGTEXT NULL,
    `uploadFilePathArr` LONGTEXT NOT NULL,
    `issueTalkId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- CreateTable
CREATE TABLE `Report` (
    `id` VARCHAR(191) NOT NULL,
    `insertTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reportName` VARCHAR(191) NOT NULL,
    `reportDesc` LONGTEXT NOT NULL,
    `reportUser` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
