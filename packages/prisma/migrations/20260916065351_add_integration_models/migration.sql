-- CreateTable
CREATE TABLE `Integration` (
    `id` VARCHAR(191) NOT NULL,
    `adapterKey` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `vendor` VARCHAR(191) NOT NULL,
    `category` ENUM('SOAR', 'EDR', 'NDR', 'INTEL', 'OS', 'C2') NOT NULL,
    `mode` ENUM('API', 'AGENT') NOT NULL,
    `status` ENUM('PENDING', 'CONNECTED', 'ERROR', 'DISABLED') NOT NULL DEFAULT 'PENDING',
    `baseUrl` VARCHAR(191) NULL,
    `secret` TEXT NULL,
    `ingestTokenHash` VARCHAR(191) NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `lastSyncAt` DATETIME(3) NULL,
    `lastError` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Integration_adapterKey_key`(`adapterKey`),
    INDEX `Integration_status_idx`(`status`),
    INDEX `Integration_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CollectedLog` (
    `id` VARCHAR(191) NOT NULL,
    `integrationId` VARCHAR(191) NOT NULL,
    `source` VARCHAR(191) NOT NULL,
    `severity` VARCHAR(191) NULL,
    `message` TEXT NOT NULL,
    `raw` JSON NOT NULL,
    `collectedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CollectedLog_integrationId_collectedAt_idx`(`integrationId`, `collectedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CollectedLog` ADD CONSTRAINT `CollectedLog_integrationId_fkey` FOREIGN KEY (`integrationId`) REFERENCES `Integration`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
