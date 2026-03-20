import { AttackDataItem } from "~/types/defend";
import { useI18n } from "~/i18n/I18nProvider";

interface GeneralTabProps {
  data: AttackDataItem;
}

export const GeneralTab: React.FC<GeneralTabProps> = ({ data }) => {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      {/* Grid Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="flex flex-col col-span-1">
          <label className="text-sm font-bold mb-2">
            {t("abilities.general.abilityId")}
          </label>
          <input
            className="bg-base-800 p-2 rounded border border-base-850"
            placeholder={t("abilities.general.placeholderId")}
            defaultValue={data.ability_id}
          />
        </div>
        <div className="flex flex-col md:col-span-2">
          <label className="text-sm font-bold mb-2">
            {t("abilities.general.abilityUid")}
          </label>
          <input
            className="bg-base-800 p-2 rounded border border-base-850"
            placeholder={t("abilities.general.placeholderUid")}
            defaultValue={data.technique_id}
          />
        </div>
        <div className="flex flex-col col-span-1">
          <label className="text-sm font-bold mb-2">
            {t("abilities.general.name")}
          </label>
          <input
            className="bg-base-800 p-2 rounded border border-base-850"
            placeholder={t("abilities.general.placeholderName")}
            defaultValue={data.ability_name}
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="text-sm font-bold mb-2 block">
          {t("abilities.general.description")}
        </label>
        <textarea
          className="bg-base-800 p-2 rounded w-full border border-base-850"
          placeholder={t("abilities.general.placeholderContent")}
          rows={3}
          defaultValue={data.description}
        />
      </div>

      {/* State Radio Buttons */}
      <div>
        <label className="text-sm font-bold mb-2 block">
          {t("abilities.general.state")}
        </label>
        <div className="flex gap-6">
          {/* {Object.values(HeatmapEvaluationFramework).map((val) => (
            <label key={val} className="inline-flex items-center space-x-2">
              <input
                type="radio"
                name="state"
                value={val}
                checked={state === val}
                onChange={() => setState(val)}
                className="accent-blue-500"
              />
              <span>{val}</span>
            </label>
          ))} */}
        </div>
      </div>

      {/* Zip Inputs */}
      <div className="space-y-2">
        <input
          className="bg-base-800 p-2 rounded w-full border border-base-850"
          placeholder={t("abilities.general.placeholderZip")}
        />
        <input
          className="bg-base-800 p-2 rounded w-full border border-base-850"
          placeholder={t("abilities.general.placeholderZip")}
        />
      </div>

      {/* Related Threat Group */}
      <div>
        <label className="text-sm font-bold mb-2 block">
          {t("abilities.general.relatedThreatGroup")}
        </label>
        <input
          type="file"
          className="bg-base-800 w-full text-sm text-gray-400 file:py-2 file:px-4 file:border-0 file:bg-neutral-500 file:hover:bg-neutral-600 file:text-white mb-2 file:rounded-l"
        />
        <textarea
          className="bg-base-800 p-2 rounded w-full border border-base-850"
          rows={3}
          defaultValue={data.description}
        ></textarea>
      </div>

      {/* Related CVE */}
      <div>
        <label className="text-sm font-bold mb-2 block">
          {t("abilities.general.relatedCve")}
        </label>
        <input
          type="file"
          className="bg-base-800 w-full text-sm text-gray-400 file:py-2 file:px-4 file:border-0 file:bg-neutral-500 file:hover:bg-neutral-600 file:text-white mb-2 file:rounded-l"
        />
        <textarea
          className="bg-base-800 p-2 rounded w-full border border-base-850"
          rows={3}
          defaultValue={data.description}
        ></textarea>
      </div>
    </div>
  );
};
