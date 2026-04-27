/*
  Warnings:

  - You are about to drop the column `assignedId` on the `task` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `task` DROP FOREIGN KEY `Task_assignedId_fkey`;

-- DropIndex
DROP INDEX `Task_assignedId_fkey` ON `task`;

-- AlterTable
ALTER TABLE `task` DROP COLUMN `assignedId`,
    ADD COLUMN `assigneeId` BIGINT NULL;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_assigneeId_fkey` FOREIGN KEY (`assigneeId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
