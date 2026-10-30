-- AlterTable
ALTER TABLE `AgentInstruction` ADD COLUMN `abilityId` VARCHAR(191) NULL,
    ADD COLUMN `abilityName` VARCHAR(191) NULL,
    ADD COLUMN `operationId` VARCHAR(191) NULL,
    ADD COLUMN `payloads` JSON NOT NULL,
    ADD COLUMN `stepOrder` INTEGER NULL,
    MODIFY `status` ENUM('QUEUED', 'SENT', 'COMPLETE', 'TIMEOUT', 'SKIPPED') NOT NULL DEFAULT 'QUEUED';

-- CreateTable
CREATE TABLE `Operation` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `state` ENUM('RUNNING', 'PAUSED', 'FINISHED') NOT NULL DEFAULT 'RUNNING',
    `targetPaws` JSON NOT NULL,
    `targetGroup` VARCHAR(191) NULL,
    `plan` JSON NOT NULL,
    `facts` JSON NOT NULL,
    `stopOnError` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `finishedAt` DATETIME(3) NULL,

    INDEX `Operation_state_idx`(`state`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `AgentInstruction_operationId_stepOrder_idx` ON `AgentInstruction`(`operationId`, `stepOrder`);

-- AddForeignKey
ALTER TABLE `AgentInstruction` ADD CONSTRAINT `AgentInstruction_operationId_fkey` FOREIGN KEY (`operationId`) REFERENCES `Operation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
