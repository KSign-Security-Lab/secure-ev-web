-- CreateTable
CREATE TABLE `Agent` (
    `paw` VARCHAR(191) NOT NULL,
    `group` VARCHAR(191) NOT NULL DEFAULT 'red',
    `architecture` VARCHAR(191) NOT NULL DEFAULT '',
    `platform` VARCHAR(191) NOT NULL DEFAULT '',
    `server` VARCHAR(512) NOT NULL DEFAULT '',
    `upstreamDest` VARCHAR(512) NOT NULL DEFAULT '',
    `username` VARCHAR(191) NOT NULL DEFAULT '',
    `location` VARCHAR(512) NOT NULL DEFAULT '',
    `pid` INTEGER NULL,
    `ppid` INTEGER NULL,
    `executors` JSON NOT NULL,
    `privilege` VARCHAR(191) NOT NULL DEFAULT '',
    `exeName` VARCHAR(191) NOT NULL DEFAULT '',
    `host` VARCHAR(191) NOT NULL DEFAULT '',
    `contact` VARCHAR(191) NOT NULL DEFAULT 'HTTP',
    `proxyReceivers` JSON NOT NULL,
    `proxyChain` JSON NOT NULL,
    `originLinkId` VARCHAR(191) NOT NULL DEFAULT '',
    `deadmanEnabled` BOOLEAN NOT NULL DEFAULT false,
    `availableContacts` JSON NOT NULL,
    `hostIpAddrs` JSON NOT NULL,
    `pendingContact` VARCHAR(191) NULL,
    `sleepMin` INTEGER NOT NULL DEFAULT 30,
    `sleepMax` INTEGER NOT NULL DEFAULT 60,
    `watchdog` INTEGER NOT NULL DEFAULT 0,
    `interactiveUntil` DATETIME(3) NULL,
    `firstSeen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastSeen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Agent_lastSeen_idx`(`lastSeen`),
    PRIMARY KEY (`paw`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AgentInstruction` (
    `id` VARCHAR(191) NOT NULL,
    `paw` VARCHAR(191) NOT NULL,
    `command` MEDIUMTEXT NOT NULL,
    `executor` VARCHAR(191) NOT NULL,
    `timeout` INTEGER NOT NULL DEFAULT 60,
    `status` ENUM('QUEUED', 'SENT', 'COMPLETE', 'TIMEOUT') NOT NULL DEFAULT 'QUEUED',
    `queuedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `sentAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,

    INDEX `AgentInstruction_paw_status_idx`(`paw`, `status`),
    INDEX `AgentInstruction_queuedAt_idx`(`queuedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AgentResult` (
    `id` VARCHAR(191) NOT NULL,
    `instructionId` VARCHAR(191) NOT NULL,
    `output` LONGTEXT NOT NULL,
    `stderr` LONGTEXT NOT NULL,
    `exitCode` VARCHAR(191) NOT NULL DEFAULT '',
    `status` VARCHAR(191) NOT NULL DEFAULT '',
    `pid` VARCHAR(191) NOT NULL DEFAULT '',
    `agentReportedTime` VARCHAR(191) NOT NULL DEFAULT '',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `AgentResult_instructionId_key`(`instructionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AgentConfig` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `implantName` VARCHAR(191) NOT NULL DEFAULT 'splunkd',
    `sleepMin` INTEGER NOT NULL DEFAULT 30,
    `sleepMax` INTEGER NOT NULL DEFAULT 60,
    `watchdog` INTEGER NOT NULL DEFAULT 0,
    `untrustedTimer` INTEGER NOT NULL DEFAULT 90,
    `c2Url` VARCHAR(512) NOT NULL DEFAULT 'http://0.0.0.0:8888',
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Ability_platform_idx` ON `Ability`(`platform`);

-- CreateIndex
CREATE INDEX `Ability_tactic_idx` ON `Ability`(`tactic`);

-- CreateIndex
CREATE INDEX `Ability_technique_id_idx` ON `Ability`(`technique_id`);

-- AddForeignKey
ALTER TABLE `AgentInstruction` ADD CONSTRAINT `AgentInstruction_paw_fkey` FOREIGN KEY (`paw`) REFERENCES `Agent`(`paw`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AgentResult` ADD CONSTRAINT `AgentResult_instructionId_fkey` FOREIGN KEY (`instructionId`) REFERENCES `AgentInstruction`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
