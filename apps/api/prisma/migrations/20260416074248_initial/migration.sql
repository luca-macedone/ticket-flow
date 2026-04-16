-- CreateTable
CREATE TABLE `User` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `pswHash` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `role` ENUM('USER', 'ADMIN', 'GUEST', 'ON_APPROVAL') NOT NULL DEFAULT 'ON_APPROVAL',

    UNIQUE INDEX `User_id_key`(`id`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Project` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `projectName` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `companyId` BIGINT NOT NULL,

    UNIQUE INDEX `Project_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Company` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `companyName` VARCHAR(191) NOT NULL,
    `nationality` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `referralEmail` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Company_id_key`(`id`),
    UNIQUE INDEX `Company_referralEmail_key`(`referralEmail`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Task` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `taskCode` VARCHAR(191) NOT NULL,
    `taskName` VARCHAR(191) NOT NULL,
    `taskDescription` VARCHAR(191) NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `status` ENUM('ON_HOLD', 'ON_APPROVAL', 'ON_QUEUE', 'FULFILLMENT', 'APPROVED', 'REJECTED', 'DONE', 'CANCELLED') NOT NULL,
    `projectId` BIGINT NULL,

    UNIQUE INDEX `Task_id_key`(`id`),
    UNIQUE INDEX `Task_taskCode_key`(`taskCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ProjectToUser` (
    `A` BIGINT NOT NULL,
    `B` BIGINT NOT NULL,

    UNIQUE INDEX `_ProjectToUser_AB_unique`(`A`, `B`),
    INDEX `_ProjectToUser_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ProjectToUser` ADD CONSTRAINT `_ProjectToUser_A_fkey` FOREIGN KEY (`A`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ProjectToUser` ADD CONSTRAINT `_ProjectToUser_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
