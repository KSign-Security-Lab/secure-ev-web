-- AlterTable
ALTER TABLE `CollectedLog` ADD COLUMN `occurredAt` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `CollectedLog_integrationId_occurredAt_idx` ON `CollectedLog`(`integrationId`, `occurredAt`);
