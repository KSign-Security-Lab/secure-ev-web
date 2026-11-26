import { AttackDataItem } from "~/types/defend";
import { useI18n } from "~/i18n/I18nProvider";
import { TagInput } from "~/components/common/TagInput/TagInput";
import type { AbilityForm } from "./form";
import { NativeSelect } from "~/components/common/Select/NativeSelect";

interface GeneralTabProps {
  data: AttackDataItem;
  form: AbilityForm;
  onChange: (patch: Partial<AbilityForm>) => void;
}

const fieldLabel = "mb-1.5 block text-sm font-semibold text-neutral-800";
const inputBase =
  "h-10 w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";
const readOnlyInput = `${inputBase} font-mono text-neutral-600 cursor-default`;

const CVE_PATTERN = /^CVE-\d{4}-\d{4,}$/;

export const GeneralTab: React.FC<GeneralTabProps> = ({ data, form, onChange }) => {
  const { t } = useI18n();

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="ability-id" className={fieldLabel}>
            {t("abilities.general.abilityId")}
          </label>
          <input
            id="ability-id"
            className={readOnlyInput}
            value={data.ability_id}
            title={data.ability_id}
            readOnly
          />
        </div>
        <div>
          <label htmlFor="ability-technique" className={fieldLabel}>
            {t("abilities.general.techniqueId")}
          </label>
          <input
            id="ability-technique"
            className={readOnlyInput}
            value={data.technique_id}
            title={data.technique_id}
            readOnly
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_12rem]">
        <div>
          <label htmlFor="ability-name" className={fieldLabel}>
            {t("abilities.general.name")}
          </label>
          <input
            id="ability-name"
            className={inputBase}
            placeholder={t("abilities.general.placeholderName")}
            value={form.ability_name}
            onChange={(e) => onChange({ ability_name: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="ability-status" className={fieldLabel}>
            {t("abilities.general.state")}
          </label>
          <NativeSelect
            id="ability-status"
            className="bg-neutral-50"
            value={form.status}
            onChange={(e) => onChange({ status: e.target.value as AbilityForm["status"] })}
          >
            <option value="ACTIVE">{t("abilities.general.status.active")}</option>
            <option value="DISABLED">{t("abilities.general.status.disabled")}</option>
          </NativeSelect>
        </div>
      </div>

      <div>
        <label htmlFor="ability-description" className={fieldLabel}>
          {t("abilities.general.description")}
        </label>
        <textarea
          id="ability-description"
          className="w-full rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          placeholder={t("abilities.general.placeholderContent")}
          rows={4}
          value={form.description}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </div>

      <div>
        <label htmlFor="ability-threat-groups" className={fieldLabel}>
          {t("abilities.general.relatedThreatGroup")}
        </label>
        <TagInput
          id="ability-threat-groups"
          value={form.threat_groups}
          onChange={(threat_groups) => onChange({ threat_groups })}
          placeholder={t("abilities.general.placeholderThreatGroup")}
          removeLabel={(v) => t("abilities.general.removeTag", { value: v })}
        />
      </div>

      <div>
        <label htmlFor="ability-cves" className={fieldLabel}>
          {t("abilities.general.relatedCve")}
        </label>
        <TagInput
          id="ability-cves"
          value={form.cves}
          onChange={(cves) => onChange({ cves })}
          placeholder={t("abilities.general.placeholderCve")}
          normalize={(raw) => raw.trim().toUpperCase()}
          validate={(v) => (CVE_PATTERN.test(v) ? null : t("abilities.general.invalidCve"))}
          removeLabel={(v) => t("abilities.general.removeTag", { value: v })}
        />
      </div>
    </div>
  );
};
