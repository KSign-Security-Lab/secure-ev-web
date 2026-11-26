import { useState } from "react";
import { TerminalSquare } from "lucide-react";
import { AttackExecutor } from "~/types/defend";
import { useI18n } from "~/i18n/I18nProvider";
import { EmptyState } from "~/components/common/EmptyState/EmptyState";
import { display, platformLabel } from "~/lib/format";
import { NativeSelect } from "~/components/common/Select/NativeSelect";

const fieldLabel = "mb-1.5 block text-sm font-semibold text-neutral-800";
const readOnly =
  "h-10 w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-700";

const ExecutorDetail: React.FC<{ exec: AttackExecutor }> = ({ exec }) => {
  const { t } = useI18n();
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div>
          <span className={fieldLabel}>{t("abilities.executors.platform")}</span>
          <div className={`${readOnly} flex items-center`}>{platformLabel(exec.platform)}</div>
        </div>
        <div>
          <span className={fieldLabel}>{t("abilities.executors.shell")}</span>
          <div className={`${readOnly} flex items-center font-mono`}>{display(exec.shell)}</div>
        </div>
        <div>
          <span className={fieldLabel}>{t("abilities.executors.timeout")}</span>
          <div className={`${readOnly} flex items-center tabular-nums`}>
            {t("abilities.executors.seconds", { value: exec.timeout })}
          </div>
        </div>
        <div>
          <span className={fieldLabel}>{t("abilities.executors.cleanup")}</span>
          <div className={`${readOnly} flex items-center tabular-nums`}>{exec.cleanup}</div>
        </div>
      </div>

      <div>
        <span className={fieldLabel}>{t("abilities.executors.command")}</span>
        <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-all rounded-md bg-neutral-950 p-3 font-mono text-sm leading-relaxed text-neutral-100">
          {exec.command || "—"}
        </pre>
      </div>

      <div>
        <span className={fieldLabel}>{t("abilities.executors.payloads")}</span>
        {exec.payloads.length ? (
          <ul className="space-y-1 rounded-md border border-neutral-200 bg-neutral-50 p-3 font-mono text-xs text-neutral-700">
            {exec.payloads.map((p, i) => (
              <li key={i} className="break-all">
                {p}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-neutral-500">{t("abilities.executors.noPayloads")}</p>
        )}
      </div>
    </div>
  );
};

interface ExecutorsTabProps {
  data: AttackExecutor[];
}

export const ExecutorsTab: React.FC<ExecutorsTabProps> = ({ data }) => {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);

  if (!data.length) {
    return (
      <EmptyState
        size="sm"
        icon={TerminalSquare}
        title={t("abilities.executors.emptyTitle")}
        description={t("abilities.executors.emptyDescription")}
      />
    );
  }

  const current = data[Math.min(index, data.length - 1)];

  return (
    <div className="space-y-5">
      <div className="max-w-sm">
        <label htmlFor="ability-executor" className={fieldLabel}>
          {t("abilities.executors.label")}
        </label>
        <NativeSelect
          id="ability-executor"
          className="bg-neutral-50"
          value={index}
          onChange={(e) => setIndex(Number(e.currentTarget.value))}
        >
          {data.map((exec, i) => (
            <option key={i} value={i}>
              {t("abilities.executors.option", {
                index: i + 1,
                platform: platformLabel(exec.platform),
                shell: display(exec.shell),
              })}
            </option>
          ))}
        </NativeSelect>
      </div>
      <ExecutorDetail exec={current} />
    </div>
  );
};
