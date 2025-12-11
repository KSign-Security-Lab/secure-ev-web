-- CreateTable
CREATE TABLE `FuzzingJob` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `targetType` ENUM('ISO15118', 'OCPP_CHARGER', 'OCPP_SERVER') NOT NULL,
    `environment` VARCHAR(191) NOT NULL,
    `connectionConfig` JSON NOT NULL,
    `fuzzingParameters` JSON NOT NULL,
    `status` ENUM('DRAFT', 'PENDING', 'RUNNING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'DRAFT',
    `authTokenHash` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `FuzzingJob_status_idx`(`status`),
    INDEX `FuzzingJob_targetType_idx`(`targetType`),
    INDEX `FuzzingJob_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FuzzingReport` (
    `id` VARCHAR(191) NOT NULL,
    `jobId` VARCHAR(191) NOT NULL,
    `payload` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `FuzzingReport_jobId_key`(`jobId`),
    INDEX `FuzzingReport_jobId_idx`(`jobId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FuzzingReport` ADD CONSTRAINT `FuzzingReport_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `FuzzingJob`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
