-- CreateTable
CREATE TABLE `AdminLog` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `actorId` BIGINT NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `targetType` VARCHAR(191) NOT NULL,
    `targetCode` VARCHAR(191) NULL,
    `targetLabel` VARCHAR(191) NULL,
    `details` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `AdminLog_id_key`(`id`),
    INDEX `AdminLog_createdAt_idx`(`createdAt`),
    INDEX `AdminLog_actorId_idx`(`actorId`),
    INDEX `AdminLog_targetType_idx`(`targetType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SystemLog` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `level` ENUM('INFO', 'WARN', 'ERROR') NOT NULL DEFAULT 'ERROR',
    `message` TEXT NOT NULL,
    `stack` TEXT NULL,
    `context` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AdminLog` ADD CONSTRAINT `AdminLog_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
