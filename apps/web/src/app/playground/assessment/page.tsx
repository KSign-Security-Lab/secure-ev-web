"use client";

import { useState } from "react";
import { SaveIcon, Trash2 } from "lucide-react";
import { useI18n } from "~/i18n/I18nProvider";
import { AssessmentTable, type AssessmentItem } from "~/components/page/playground/Assessment/AssessmentTable";
import { PageHeader } from "~/components/common/PageHeader/PageHeader";
import { FilterBar } from "~/components/common/FilterBar/FilterBar";

const MOCK_DATA: AssessmentItem[] = [
  {
    id: "1",
    name: "충전기 운영환경 방어 성능 평가",
    target: "CSMS, CP",
    attackCount: 11,
    repeatCount: 2,
    lastExecutionDate: "2026-04-10",
  },
  {
    id: "2",
    name: "충전기 보안성능 평가",
    target: "CP",
    attackCount: 4,
    repeatCount: 0,
    lastExecutionDate: null,
  },
];

export default function AssessmentPage() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 1;

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Simple filter for mock data
  const filteredData = MOCK_DATA.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full gap-4">
      <PageHeader
        title={t("assessment.page.title")}
        subtitle={t("assessment.page.subtitle")}
        badge="Playground"
        actions={
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-all font-bold uppercase text-[11px] tracking-widest shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <SaveIcon className="w-4 h-4" />
              {t("assessment.page.register")}
            </button>
            <button className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-500 px-4 py-2 rounded-lg transition-all font-bold uppercase text-[11px] tracking-widest border border-red-500/20">
              <Trash2 className="w-4 h-4" />
              {t("assessment.page.delete")}
            </button>
          </div>
        }
      />

      <div className="flex flex-col gap-6 min-h-0 min-w-0">
        <FilterBar 
          handleSearch={handleSearch} 
          searchPlaceholder={t("assessment.page.searchPlaceholder")}
          className="bg-slate-900/50"
        />

        <div className="flex-1">
          <AssessmentTable 
            data={filteredData} 
            pagination={{
              currentPage,
              totalPages,
              onPageChange: handlePageChange,
              totalCount: filteredData.length
            }}
          />
        </div>
      </div>
    </div>
  );
}
