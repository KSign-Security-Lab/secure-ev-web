-- AlterTable
ALTER TABLE `FuzzingJob` ADD COLUMN `scope` JSON NULL,
    ADD COLUMN `targetDevice` ENUM('CHARGER', 'CSMS') NULL;

-- CreateTable
CREATE TABLE `Mitre` (
    `id` VARCHAR(191) NOT NULL,
    `tactic` VARCHAR(191) NOT NULL,
    `technique_id` VARCHAR(191) NOT NULL,
    `technique_name` VARCHAR(191) NOT NULL,
    `subtechnique_id` VARCHAR(191) NULL,
    `subtechnique_name` VARCHAR(191) NULL,
    `platform` ENUM('Enterprise', 'Mobile', 'ICS') NOT NULL,

    UNIQUE INDEX `Mitre_subtechnique_id_key`(`subtechnique_id`),
    UNIQUE INDEX `Mitre_subtechnique_name_key`(`subtechnique_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
