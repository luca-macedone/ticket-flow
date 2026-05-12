/*
  Warnings:

  - A unique constraint covering the columns `[companyCode]` on the table `Company` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[projectCode]` on the table `Project` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userCode]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `company` ADD COLUMN `companyCode` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `project` ADD COLUMN `projectCode` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `userCode` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Company_companyCode_key` ON `Company`(`companyCode`);

-- CreateIndex
CREATE UNIQUE INDEX `Project_projectCode_key` ON `Project`(`projectCode`);

-- CreateIndex
CREATE UNIQUE INDEX `User_userCode_key` ON `User`(`userCode`);
