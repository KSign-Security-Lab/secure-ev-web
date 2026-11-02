-- DropIndex
DROP INDEX `Mitre_subtechnique_id_key` ON `Mitre`;

-- DropIndex
DROP INDEX `Mitre_subtechnique_name_key` ON `Mitre`;

-- AlterTable
ALTER TABLE `Mitre` ADD COLUMN `tactic_name` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `tactic_order` INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX `Mitre_technique_id_idx` ON `Mitre`(`technique_id`);

-- CreateIndex
CREATE INDEX `Mitre_subtechnique_id_idx` ON `Mitre`(`subtechnique_id`);

-- CreateIndex
CREATE INDEX `Mitre_platform_tactic_order_idx` ON `Mitre`(`platform`, `tactic_order`);
