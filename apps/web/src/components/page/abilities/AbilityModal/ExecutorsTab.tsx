import { AttackExecutor } from "~/types/defend";
import { useState } from "react";
import { useI18n } from "~/i18n/I18nProvider";

interface InnerContentProps {
  execData: AttackExecutor;
  availablePlatforms: string[];
}

const InnerContent: React.FC<InnerContentProps> = ({
  execData,
  availablePlatforms,
}) => {
  const { t } = useI18n();
  return (
    <>
      {/* Platform Radio */}
      <div className="flex flex-wrap gap-6 items-center">
        {availablePlatforms.map((platform, index) => (
          <label key={platform + index} className="flex items-center gap-2">
            <input
              type="radio"
              name="platform"
              defaultChecked={platform === execData.platform}
              className="accent-blue-500"
            />
            <span>{platform}</span>
          </label>
        ))}
      </div>

      {/* Executor Radio */}
      <div className="flex flex-wrap gap-6 items-center">
        {["psh", "cmd", "proc", "MNX", "Elastic"].map((ex) => (
          <label key={ex} className="flex items-center gap-2">
            <input type="radio" name="executor" className="accent-blue-500" />
            <span>{ex}</span>
          </label>
        ))}
      </div>

      {/* Payloads */}
      <div>
        <textarea
          className="bg-base-800 p-2 w-full rounded resize-none"
          placeholder={t("abilities.executors.payloadPlaceholder")}
          rows={3}
          defaultValue={execData.payloads.join("\n")}
        />
      </div>

      {/* Command block */}
      <div>
        <label className="block text-sm font-medium mb-1">
          {t("abilities.executors.command")}
        </label>
        <textarea
          className="bg-base-800 p-2 w-full rounded resize-none font-mono text-sm leading-relaxed"
          rows={6}
          defaultValue={execData.command}
        />
      </div>

      {/* Timeout + Cleanup */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("abilities.executors.timeout")}
          </label>
          <input
            type="number"
            className="bg-base-800 p-2 rounded w-full"
            defaultValue={execData.timeout}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("abilities.executors.cleanup")}
          </label>
          <input
            type="number"
            className="bg-base-800 p-2 rounded w-full"
            defaultValue={execData.cleanup}
          />
        </div>
      </div>
    </>
  );
};

interface ExecutorsTabProps {
  data: AttackExecutor[];
}

export const ExecutorsTab: React.FC<ExecutorsTabProps> = ({ data }) => {
  const { t } = useI18n();
  const [executorData, setExecutorData] = useState<AttackExecutor | null>(null);

  return (
    <div className="space-y-4">
      {/* Choose Dropdown */}
      <div>
        <select
          className="w-full bg-base-800 p-2 rounded"
          onChange={(e) => {
            setExecutorData(data[Number(e.currentTarget.value)]);
          }}
        >
          {data?.map((_, index) => (
            <option key={index} value={index}>
              {t("abilities.executors.executorIndex", { index })}
            </option>
          ))}
        </select>
      </div>
      {executorData ? (
        <InnerContent
          execData={executorData}
          availablePlatforms={data.map((it) => it.platform)}
        />
      ) : null}
    </div>
  );
};
